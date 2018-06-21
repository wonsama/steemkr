const readline = require('readline');

/*
* see : https://blog.grossman.io/how-to-write-async-await-without-try-catch-blocks-in-javascript/
*/
let fn = {};

/*
* await 에서 error 처리를 사용하기 쉽게 wrap
* @param promise promise 개체
* @return 처리결과 [err, data]
*/
fn.to = (promise) =>{
  return promise
  .then(data=>[null,data])
  .catch(err=>[err]);
}

fn.question = (msg)=>{
  return new Promise((resolve, reject)=>{
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    try{
      rl.question(msg, answer=>{
          rl.close();
          resolve(answer);
      });
    }catch(e){
      reject(e);
    }
  });
}

module.exports = fn;