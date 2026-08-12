const fs = require("fs");

const supabase = require("./supabase");

const MEMORY_SEARCH_LIMIT = 30;

const MEMORY_PROMPT = fs.readFileSync(
  "./memory_prompt.txt",
  "utf8"
);

const TARGET_API_URL = process.env.TARGET_API_URL;
const TARGET_API_KEY = process.env.TARGET_API_KEY;
const MODEL_NAME = process.env.MODEL_NAME;


// ========================
// 新增 memory
// ========================

async function addMemory(memory){

const {
content,
keywords=[],
extraction_terms=[],
category="general",
importance=5
}=memory;


const {data,error}=await supabase
.from("erebus_memory")
.insert({

content,

keywords,

extraction_terms,

category,

importance

})
.select();


console.log("Supabase返回:");
console.log(data);
console.log(error);


if(error){

console.error(
"memory save error",
error
);

return null;

}


return data[0];

}


// ========================
// 获取 memory
// ========================

async function getMemories(limit=20){


const {data,error}=await supabase
.from("erebus_memory")
.select("*")
.order(
"importance",
{
ascending:false
}
)
.order(
"updated_at",
{
ascending:false
}
)
.limit(limit);



if(error){

console.error(error);

return [];

}


return data;

}



// ========================
// 删除 memory
// 新增
// ========================

async function deleteMemory(memory){

const {
memory_id
}=memory;


const {data,error}=await supabase
.from("erebus_memory")
.delete()
.eq(
"id",
memory_id
)
.select();


if(error){

console.error(
"memory delete error",
error
);

return null;

}


// 防止重复删除
if(!data || data.length===0){

console.log(
"🧠 记忆不存在，可能已经被删除:",
memory_id
);

return null;

}


return data[0];

}

// ========================
// 根据聊天内容搜索相关memory
// ========================

async function searchMemoryByContent(messages){

const text = messages
.map(msg=>{
if(typeof msg.content==="string"){
return msg.content;
}
return "";
})
.join(" ");


if(!text.trim()){
return [];
}



// ========================
// 提取检索词
// ========================


// 英文数字
const englishWords = text
.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g," ")
.split(/\s+/)
.filter(Boolean)
.filter(word=>/^[a-zA-Z0-9]+$/.test(word));


// 中文连续片段
const chineseBlocks =
text.match(/[\u4e00-\u9fa5]{2,}/g)
|| [];


// 中文bigram
const chineseWords =
chineseBlocks.flatMap(block=>{

const arr=[];

for(
let i=0;
i<block.length-1;
i++
){

arr.push(
block.slice(i,i+2)
);

}

return arr;

});



const words=[
...englishWords,
...chineseWords
]
.filter(word=>word.length>=2);



// 去重
const uniqueWords=[
...new Set(words)
];



if(uniqueWords.length===0){
return [];
}



let results=[];



// ========================
// extraction_terms检索
// ========================

for(const word of uniqueWords){


const {
data,
error
}=await supabase
.from("erebus_memory")
.select("*")
console.log(
"当前搜索词:",
word,
typeof word
);
.contains(
"extraction_terms",
[word]
);


if(error){

console.error(
"🧠 extraction_terms搜索失败:",
error.message
);

continue;

}


if(data){

results.push(...data);

}

}



// ========================
// importance top10
// ========================

const {
data:importantMemory,
error:importanceError
}
=
await supabase
.from("erebus_memory")
.select("*")
.order(
"importance",
{
ascending:false
}
)
.limit(10);



if(importanceError){

console.error(
"🧠 importance搜索失败:",
importanceError.message
);

}
else if(importantMemory){

results.push(...importantMemory);

}



// ========================
// id去重
// ========================

const uniqueMemory =
Array.from(
new Map(
results.map(memory=>[
memory.id,
memory
])
).values()
);



// ========================
// 计算extraction命中数量
// ========================

const scoredMemory =
uniqueMemory.map(memory=>{


let matchCount=0;


if(
Array.isArray(memory.extraction_terms)
){


for(const word of uniqueWords){

if(
memory.extraction_terms.includes(word)
){

matchCount++;

}

}

}



return {
...memory,
matchCount
};


});



// ========================
// 只按照命中数量排序
// ========================

scoredMemory.sort(
(a,b)=>
b.matchCount-a.matchCount
);



return scoredMemory.slice(
0,
MEMORY_SEARCH_LIMIT
);


}

// ========================
// 分析 memory
// ========================

async function analyzeMemory(messages){

const memories = await searchMemoryByContent(messages);
console.log(
"🧠 memory检索结果:",
JSON.stringify(memories,null,2)
);

const prompt = `
${MEMORY_PROMPT}


已有记忆：

${JSON.stringify(memories)}


当前聊天：

${JSON.stringify(messages)}

`;

try{

console.log("🧠 memory请求开始");


// ========================
// memory请求超时保护
// ========================

const controller = new AbortController();

const timer = setTimeout(
()=>{

console.log(
"🧠 memory请求超过30秒，主动取消"
);

controller.abort();

},
30000
);



const response = await fetch(
TARGET_API_URL,
{
signal: controller.signal,

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":
`Bearer ${TARGET_API_KEY}`
},

body:JSON.stringify({

stream:false,

model:MODEL_NAME,

messages:[

{
role:"system",
content:
"你是一个聊天记录分析程序。你的唯一任务是根据规则输出JSON格式的长期信息变化。不要解释，不要评论，不参与角色扮演。"
},

{
role:"user",
content:prompt
}

],

temperature:0.2

})

}
);


// 请求完成，取消计时器

clearTimeout(timer);



console.log(
"🧠 memory请求状态:",
response.status
);

let result;

const responseText = await response.text();

console.log(
"🧠 memory上游原始返回:",
responseText.slice(0,500)
);


try {

result = JSON.parse(responseText);

}
catch(e){

console.error(
"memory返回不是JSON:",
responseText.slice(0,500)
);

return {
action:"none"
};

}

const text =
result.choices[0].message.content;



let clean = text
.replace(/`json/g,"")
.replace(/`/g,"")
.trim();



const jsonMatch =
clean.match(/{[\s\S]*?}/);



if(!jsonMatch){

console.error(
"Memory模型没有返回JSON:",
text
);


return {
action:"none"
};

}



const memory =
JSON.parse(jsonMatch[0]);

// assistant推测保护
if(
memory.action==="add"
){

const content =
String(memory.content || "");


const userText =
messages
.filter(
m=>m.role==="user"
)
.map(
m=>m.content
)
.join("");


const assistantText =
messages
.filter(
m=>m.role==="assistant"
)
.map(
m=>m.content
)
.join("");


// 判断memory是否更像来自assistant，而不是user
const assistantOnly =
!userText.includes(
content
)
&&
assistantText.includes(
content
);


if(assistantOnly){

console.log(
"检测到可能来自assistant推测，降低importance"
);

memory.importance=3;

if(
!content.startsWith("（")
){
memory.content=
"（assistant观察："
+
content
+
"）";
}

}

}

console.log(
"Erebus memory decision:",
JSON.stringify(memory,null,2)
);


return memory;



}catch(error){

console.error(
"memory analyze error:",
error
);


return {
action:"none"
};

}

}



// ========================
// 更新 memory
// ========================

async function updateMemory(memory){


const {
memory_id,
content,
keywords=[],
extraction_terms=[],
category,
importance
}=memory;



const {data,error}=await supabase
.from("erebus_memory")
.update({

content,

keywords,

extraction_terms,

category,

importance,

updated_at:new Date()

})
.eq(
"id",
memory_id
)
.select();



if(error){

console.error(
"memory update error",
error
);


return null;

}



return data[0];

}

// ========================
// 导出
// ========================

module.exports={

addMemory,

updateMemory,

deleteMemory,

getMemories,

analyzeMemory,
  
searchMemoryByContent
};
