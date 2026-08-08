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