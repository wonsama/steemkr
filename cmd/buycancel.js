const {getLocalTime} = require('../util/wdate');
const {question} = require('../util/wutil');
const {to} = require('../util/wutil');

const steem = require('steem');
const dateFormat = require('dateformat');
const ora = require('ora');

// 기본값

const STEEM_AUTHOR = process.env.STEEM_AUTHOR;
const STEEM_KEY_ACTIVE = process.env.STEEM_KEY_ACTIVE;


/*
* 파라미터 정보를 초기화 해준다
* @param args 외부로부터 입력받은 파라미터 
*/
function initParams(args)
{
  // 초기화
  args = args?args:[];  // new 처리 하므로 return 처리 해야 됨에 유의

  // 1번째 : 작가
  if(args.length==0){
    if(STEEM_AUTHOR){
      args.push(STEEM_AUTHOR);
    }
  }

  // 2번째 : 엑티브 키
  if(args.length==1){
    if(STEEM_KEY_ACTIVE){
      args.push(STEEM_KEY_ACTIVE);
    }
  }

  return args;
}

let spinner;
async function orderCancel(author, wif){

  let err;

  // 내부거래소 주문 목록 조회
  let orders;
  spinner = ora().start('loading orders');
  [err,orders] = await to(steem.api.getOpenOrdersAsync(author));
  if(err){
    // 오류처리
    spinner.fail();
    return Promise.reject(err);
  }
  spinner.succeed(' ');

  // 내부거래소 주문 목록 출력 
  let orderlist = [];
  for(let result of orders){
    console.log(`x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x`);
    console.log(`⚡️ 주문번호 : ${result.orderid} (삭제시 필요)`);
    console.log(`x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x`);
    console.log(`판매 : ${result.sell_price.base}`);
    console.log(`구매 : ${result.sell_price.quote}`);
    console.log(`____________________________________________________________`);
    console.log(`생성일 : ${dateFormat(getLocalTime(result.created),'yyyy-mm-dd HH:MM:ss')}`);
    console.log(`만료일 : ${dateFormat(getLocalTime(result.expiration),'yyyy-mm-dd HH:MM:ss')}`);
    console.log(`____________________________________________________________`);

    orderlist.push(result.orderid);
  }
  if(orderlist.length==0){
    // 오류처리
    return Promise.reject('주문 목록이 존재하지 않습니다.');
  }

  // 문의 
  let orderid;
  [err,orderid] = await to(question(`취소할 주문번호를 입력 바랍니다 : `));
  if(err){
    // 오류처리
    return Promise.reject(err);
  }else{
    orderid = Number(orderid.trim());  // 숫자로 변경처리 해야 됨
    if(!orderlist.includes(orderid)){
      // 오류처리
      return Promise.reject(`입력받은 주문번호 ( ${orderid} ) 는 목록 ( ${orderlist.join(', ')} ) 에 포함되지 않았습니다.`);
    }
  }

  // 주문 취소
  let cancel;
  spinner = ora().start('canceling orders');
  [err,cancel] = await to(steem.broadcast.limitOrderCancelAsync(wif, author, orderid));
  if(err){
    // 오류처리
    spinner.fail();
    return Promise.reject(err);
  }
  spinner.succeed(' ');

  return Promise.resolve(orderid);
}

module.exports = (args)=>{

  // 파라미터 초기화
  args = initParams(args);

  // 입력 파라미터 유효성 검증 
  if(args.length!=2){
    console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
    help('buycancel');
    return;
  }

  let author = args[0];
  let wif = args[1];

  orderCancel(author, wif)
  .then(orderid=>{
    console.log(`____________________________________________________________`);
    console.log(`처리완료 : `);
    console.log(`주문번호 (${orderid}) 가 정상적으로 취소되었습니다.`);
    console.log(`____________________________________________________________`);
  })
  .catch(e=>{
    console.log(`____________________________________________________________`);
    console.log(`오류발생 : `);
    console.error(e);
    console.log(`____________________________________________________________`);
  });
};