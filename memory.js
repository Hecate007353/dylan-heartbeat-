const supabase = require("./supabase");



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




module.exports={
addMemory,
getMemories
};
