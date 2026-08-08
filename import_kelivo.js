const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");


// ===== Supabase 配置 =====

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("缺少 SUPABASE_URL 或 SUPABASE_SERVICE_KEY");
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ===== Kelivo 文件 =====

const file = "./chats(2).json";

const raw = fs.readFileSync(file, "utf8");
const data = JSON.parse(raw);


// ===== 提取消息 =====

let messages = [];

function walk(obj) {
  if (!obj) return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      walk(item);
    }
    return;
  }


  if (
    obj.role &&
    typeof obj.content === "string" &&
    obj.timestamp
  ) {
    messages.push({
      role: obj.role,
      content: obj.content,
      created_at: obj.timestamp
    });
  }


  if (typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      walk(obj[key]);
    }
  }
}


walk(data);


console.log("发现消息:", messages.length);



// ===== 按时间排序 =====

messages.sort(
  (a,b)=>
    new Date(a.created_at)
    -
    new Date(b.created_at)
);



console.log(
  "第一条:",
  messages[0]
);

console.log(
  "最后一条:",
  messages[messages.length-1]
);



// ===== 插入 Supabase =====

async function main(){

  const batchSize = 100;

  let success = 0;


  for(
    let i=0;
    i<messages.length;
    i+=batchSize
  ){

    const batch =
      messages.slice(
        i,
        i+batchSize
      );


    const {error}=await supabase
      .from("message")
      .insert(batch);


    if(error){
      console.error(
        "插入失败:",
        error
      );
      process.exit(1);
    }


    success += batch.length;


    console.log(
      `已导入 ${success}/${messages.length}`
    );
  }


  console.log(
    "✅ Kelivo 导入完成"
  );
}


main();
