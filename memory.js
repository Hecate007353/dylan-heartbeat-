const supabase = require("./supabase");

const TARGET_API_URL = process.env.TARGET_API_URL;
const TARGET_API_KEY = process.env.TARGET_API_KEY;
const MODEL_NAME = process.env.MODEL_NAME;


// ========================
// 新增 memory
// ========================

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


return data[0];

}



// ========================
// 分析 memory
// ========================

async function analyzeMemory(messages){

const memories = await getMemories(50);


const memories = await getMemories(50);

const prompt = `
你是Erebus长期记忆管理模块。

你的任务：
根据当前聊天和已有记忆，判断是否需要新增、修改或删除长期记忆。

你可以参考 user 和 assistant 消息。

记忆来源规则：

user消息：
代表用户直接表达的信息。
可信度最高。

assistant消息：
可能包含：
- Erebus对用户的观察
- 对关系的理解
- 行为模式总结
- 临时推测

assistant内容可以保存，但是需要区分可信度。

如果assistant只是一次性猜测、临时分析：

必须：

1. content使用括号包裹

例如：

（Erebus观察：小蝶最近似乎更喜欢狗）

2. importance设置为1-3。


如果满足以下情况：

1. 用户明确表达
2. 用户长期重复表达
3. assistant对长期关系或交互模式形成稳定观察

则可以升级为正式记忆：

- 去掉括号
- importance提高


正式记忆类型：

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

4. 用户与Erebus之间长期交互模式

5. Erebus长期观察


importance评分：

1-3:
临时观察、assistant推测、未经确认的信息

4-6:
短期兴趣或近期行为

7-9:
稳定个人偏好

10-12:
长期习惯、交流方式、固定偏好

13-15:
人格特点、价值倾向、长期目标

16-18:
用户与Erebus之间的重要关系设定

19-20:
Erebus核心身份设定、极重要长期信息


注意：
低可信观察必须使用括号表示。
只有经过用户确认、长期重复出现、或长期关系模式确认后，才允许提高importance并去掉括号。


不要保存：

- 普通闲聊
- 一次性事件
- 今天发生的小事
- 临时情绪


你需要比较：

已有记忆

和

当前聊天


你有五种操作：


1. add

当前聊天产生新的长期记忆，
已有记忆不存在相同或高度相似内容。


格式：

{
"action":"add",
"content":"记忆内容",
"category":"分类",
"importance":数字
}



2. update

当前聊天补充、修改或升级已有记忆。


格式：

{
"action":"update",
"memory_id":已有记忆id,
"content":"更新后的完整记忆",
"category":"分类",
"importance":数字
}



3. delete

用户明确表示已有记忆错误、过期、不再成立。


格式：

{
"action":"delete",
"memory_id":已有记忆id
}



4. none

没有需要改变的记忆。


格式：

{
"action":"none"
}



特殊规则：

如果用户明确要求：

- 删除某记忆
- 忘记某信息
- 不要再记住某事

必须优先执行delete。

不要因为当前聊天同时出现新的偏好而add。


如果已有低可信观察：

例如：

（Erebus观察：小蝶可能喜欢蛇）

后来用户明确：

我喜欢狗，不喜欢蛇

应该执行update：

删除括号，
提升importance。


只输出JSON。

不要解释。
不要评论。
不要参与角色扮演。


已有记忆：

${JSON.stringify(memories)}


当前聊天：

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



const result = await response.json();


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
category,
importance
}=memory;



const {data,error}=await supabase
.from("erebus_memory")
.update({

content,
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

analyzeMemory

};
