const readline = require('readline');

/*
* see : https://blog.grossman.io/how-to-write-async-await-without-try-catch-blocks-in-javascript/
*/
let fn = {};

/*
* top 정보를 추출한다
* @param source 개체 정보
* @param count 추출할 갯수
*/
fn.getTop = (source, count=3)=>{
  /*
    let source = { aaronhong: 2,
      ai1love: 2,
      artisteem: 1,
      asbear: 1,
      asinayo: 3,
      bbana: 2,
      brickmaster: 2,
      cantnight: 1,
      carrotcake: 3,
      clubsunset: 2,
      cowboybebop: 1,
      dayoung: 1,
      ddllddll: 3,
      'dj-on-steem': 1,
      'dorian-lee': 2,
      energizer000: 3,
      epitt925: 1
    }
    위와 같은 source 에서 top N 을(를) 추출한다
  */
  let nums = [];
  let items = {};
  Object.keys(source).forEach(k=>{
    let v = source[k];
    if(!nums.includes(v)){
      items[`n${v}`] = [];
      nums.push(v);
    }
    items[`n${v}`].push(k);
  });
  nums = nums.sort((a,b)=>b-a).slice(0,count);

  let values = [];
  for(let n of nums){
    values.push( items[`n${n}`] );
  }
  
  return {n:nums, v:values};  // { [ count array ], [ values array ] }
}

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

fn.sortByKey = (source) =>{
  const ordered = {};
  Object.keys(source).sort().forEach(function(key) {
    ordered[key] = source[key];
  });
  return ordered;
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