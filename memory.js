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


如果需要保存，输出：

{
"save":true,
"content":"简短记忆内容",
"category":"分类",
"importance":1-10
}


如果不需要：

{
"save":false
}


只输出JSON。


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


const memory=
JSON.parse(clean);


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
