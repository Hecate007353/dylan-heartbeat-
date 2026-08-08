async function createEmbedding(text){

const response = await fetch(
process.env.EMBEDDING_URL,
{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:
`Bearer ${process.env.TARGET_API_KEY}`
},
body:JSON.stringify({

model:
process.env.EMBEDDING_MODEL,

input:text

})
});


const data=await response.json();


return data.data[0].embedding;

}


module.exports={
createEmbedding
};
