require("dotenv").config();

const {
addMemory,
getMemories
}=require("./memory");


async function test(){


await addMemory({
content:"用户希望Erebus像朋友一样交流，而不是普通助手",
category:"relationship",
importance:10
});


const memories =
await getMemories();


console.log(memories);


}


test();
