const supabase = require("./supabase");

const TARGET_API_URL = process.env.TARGET_API_URL;
const TARGET_API_KEY = process.env.TARGET_API_KEY;
const MODEL_NAME = process.env.MODEL_NAME;

async function addMemory(memory){

const {
content,
category="general",
importance=5
}=memory;


const {data,error}=await supabase
.from("erebus_memory")
.insert({
    content,
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


async function analyzeMemory(messages){

const memories = await getMemories(50);
const prompt = `
你是Erebus的长期记忆管理模块。

你的任务：
判断下面聊天内容是否值得保存为长期记忆。

只保存：

1. 用户长期偏好
例如：
- 喜欢什么
- 讨厌什么
- 习惯

2. 用户身份信息
例如：
- 名字
- 工作
- 长期状态

3. 用户长期目标

4. 用户与Erebus之间的重要关系设定

5. Erebus自身长期设定


不要保存：

- 普通闲聊
- 一次性事件
- 今天发生的小事
- 临时情绪


你需要比较“已有记忆”和“当前聊天”。

你有四种操作：

1. add
当前聊天产生了一条新的长期记忆，
而已有记忆中没有相同或高度相似的信息。

2. update
当前聊天对已有记忆进行了补充、修改或纠正。

3. delete
当前聊天明确表示某条已有记忆已经不再成立。

4. none
没有值得改变的长期记忆。

如果是 add：

{
  "action": "add",
  "content": "简短、独立、长期有效的记忆",
  "category": "preference",
  "importance": 1
}

如果是 update：

{
  "action": "update",
  "memory_id": 现有记忆的id,
  "content": "更新后的完整记忆",
  "category": "分类",
  "importance": 1
}

如果是 delete：

{
  "action": "delete",
  "memory_id": 现有记忆的id
}

如果什么都不用做：

{
  "action": "none"
}


只输出JSON。


已有记忆：

${JSON.stringify(memories)}

聊天内容：

${JSON.stringify(messages)}
`;


try{


const response = await fetch(
TARGET_API_URL,
{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":
`Bearer ${TARGET_API_KEY}`
},
body:JSON.stringify({

model:MODEL_NAME,

messages:[
{
role:"system",
content:
"你是Erebus长期记忆管理模块，只负责判断是否保存长期记忆，只输出JSON。"
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


const result = await response.json();


const text =
result.choices[0].message.content;


let clean=text
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();


const memory =
JSON.parse(clean);

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
save:false
};

}

}
module.exports={
addMemory,
getMemories,
analyzeMemory
};
