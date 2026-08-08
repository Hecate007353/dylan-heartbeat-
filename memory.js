const { createClient } = require("@supabase/supabase-js");


const supabase = createClient(
 process.env.SUPABASE_URL,
 process.env.SUPABASE_KEY
);



async function addMemory(memory){

 const {
  content,
  category,
  importance
 } = memory;


 const {error}=await supabase
 .from("erebus_memory")
 .insert({
   content,
   category,
   importance
 });


 if(error){
   console.error(
    "memory save error",
    error
   );
 }

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
 .limit(limit);


 if(error){
  console.error(error);
  return [];
 }


 return data;

}



module.exports={
 addMemory,
 getMemories
};

async function analyzeMemory(messages){

 const prompt = `
你是Erebus记忆管理模块。

判断以下聊天是否值得长期保存。

只保存：
- 用户长期偏好
- 用户身份信息
- 长期目标
- 重要关系
- Erebus自身设定

不要保存：
- 临时聊天
- 情绪波动
- 一次性事件


输出JSON。


聊天:
${JSON.stringify(messages)}
`;



 //这里调用你的TARGET_API_URL


}
