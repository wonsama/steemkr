const help = require('./help');
const {getNowCHour} = require('../util/wdate');
const {getMoney} = require('../util/wsteem');
const {to} = require('../util/wutil');
const {question} = require('../util/wutil');

const steem = require('steem');
const dateFormat = require('dateformat');
const axios = require('axios');

const DEFAULT_ORDER_LIMIT = 10;

// 기본값

const STEEM_AUTHOR = process.env.STEEM_AUTHOR;
const STEEM_KEY_ACTIVE = process.env.STEEM_KEY_ACTIVE;

/*
* 스달을 가지고서 스팀을 구매한다
* @param account 계정명
* @param wif 해당 계정의 ACTIVE KEY
* @param limit 최근 거래기록 가져올 갯수 (1~100, 기본 10)
*/
async function buysteem(account, wif, limit){
    
  // 오류처리용
  let err;

  // 계정정보 확인
  let acc;
  [err, acc] = await to(steem.api.getAccountsAsync([account]));

  console.log(`____________________________________________________________`);
	console.log(` [buysteem] SBD 을(를) 가지고 STEEM 을 구매`);
  if(acc){
    if(acc.length!=1){
        // 오류처리
        return Promise.reject(`입력하신 ${account} 정보를 확인 바랍니다.`);
    }
  }else{
    // 오류처리
    return Promise.reject(err);
  }
  
  // 잔액정보 확인
  let sbd_balance = acc[0].sbd_balance;
  let sbd = getMoney(sbd_balance);
  if(sbd==0){
      // 오류처리
      return Promise.reject(`@${account} 님의 SBD 잔액이 0.000 SBD 입니다.`);
  }
	
  console.log(`____________________________________________________________`);
  console.log(` @${account} 님의 SBD 잔고 : ${sbd_balance}`);
  console.log(`____________________________________________________________`);

  // UPBIT 가격확인 SBD/STEEM
  const AXIOS_CONFIG = {
    headers: {'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'}
  };
  const UPBIT_SBD = `https://crix-api-endpoint.upbit.com/v1/crix/candles/lines?code=CRIX.UPBIT.KRW-SBD`;
  const UPBIT_STEEM = `https://crix-api-endpoint.upbit.com/v1/crix/candles/lines?code=CRIX.UPBIT.KRW-STEEM`;
  let upsbd, upsteem;
  [err, upsbd] = await to(axios.get(UPBIT_SBD, AXIOS_CONFIG));
  if(upsbd){
    let now = upsbd.data.candles[0].candleDateTimeKst.replace('T', ' ').replace('+09:00', '');
    console.log(` 1 SBD : ${upsbd.data.candles[0].tradePrice} 원 ( upbit ${now} 기준 )`);
  }else{
    // 오류처리
    return Promise.reject(err);
  }
  [err, upsteem] = await to(axios.get(UPBIT_STEEM, AXIOS_CONFIG));
  if(upsteem){
    let now = upsteem.data.candles[0].candleDateTimeKst.replace('T', ' ').replace('+09:00', '');
    console.log(` 1 STEEM : ${upsteem.data.candles[0].tradePrice} 원 ( upbit ${now} 기준 )`);
  }else{
    // 오류처리
    return Promise.reject(err);
  }
  
  // 최근 내부거래소 거래내역조회
  // bids : 매수(sbd => steem 구매), asks : 매도(steem => sbd 구매) 
  let orders;
  [err, orders] = await to(steem.api.getOrderBookAsync(limit));

  let min = Number.MAX_SAFE_INTEGER;
  let max = 0;
  let lastest = orders.asks[0].real_price;
  for(let ask of orders.asks){
    min = Math.min(min,Number(ask.real_price));
    max = Math.max(max,Number(ask.real_price));
  }

  // sbd / steem
  // real_price : 낮을수록 저렴
  console.log(`____________________________________________________________`);
  console.log(` 매도(asks) 비율가(SBD/STEEM) - 수치가 낮을수록 싸게 산것`);
  console.log(` 최근 ${limit} 개 거래의 가격을 바탕으로 나타냄`);
  console.log(`____________________________________________________________`);
  console.log(` 최저가(min) : ${min}`);
  console.log(` 최고가(max) : ${max}`);
  console.log(` 최근가(lastest) : ${lastest}`);
  console.log(`____________________________________________________________`);

  // 교환 금액 문의// rl.question blocking이 아님에 유의 !!
  let amount;
  [err,amount] = await to(question(`SBD를 얼마나 교환하시겠습니까 ( Max : ${sbd} ) ? `));
  if(!amount){
    // 오류처리
    return Promise.reject('취소 하셨습니다.');
  }else if(amount.toLowerCase()=='all'){
    // 전체
    amount = sbd;
  }else if(isNaN(amount)){
    // 오류처리
    return Promise.reject(`x.xxx 형태의 숫자만 입력 가능합니다.`);
  }else if(Number(amount)<=0){
    // 오류처리
    return Promise.reject(`0 이상으로 입력해야 됩니다.`);
  }else if(Number(amount)>sbd){
    // 오류처리
    return Promise.reject(`입력 값( ${amount} ) 는 잔고( ${sbd} ) 을(를) 초과할 수 없습니다.`);
  }

  console.log(`____________________________________________________________`);
  console.log(` 1. 최저가 : ${(amount/min).toFixed(3)} STEEM 획득`);
  console.log(` 2. 최고가 : ${(amount/max).toFixed(3)} STEEM 획득`);
  console.log(` 3. 최근가 : ${(amount/lastest).toFixed(3)} STEEM 획득`);
  console.log(` 4. 직접입력`);
  console.log(`____________________________________________________________`);

  // 교환 방식 문의 : min, max, lastest, 직접입력
  let type;
  let change;
  [err,type] = await to(question(`교환방식을 선택 바랍니다. ( 1 ~ 4 ) : `));
  switch(type){
    case '1':
      change = (amount/min).toFixed(3);
    break;
    case '2':
      change = (amount/max).toFixed(3);
    break;
    case '3':
      change = (amount/lastest).toFixed(3);
    break;
    case '4':
      [err,change] = await to(question(`${amount} SBD 와 교환 할 STEEM 량 (x.xxx) 을 입력바랍니다 : `));
      if(err){
        // 오류처리
        return Promise.reject(err);
      }else if(isNaN(change)){
        // 오류처리
        return Promise.reject(`x.xxx 형태의 숫자만 입력 가능합니다.`);
      }else if(Number(change)<=0){
        // 오류처리
        return Promise.reject(`0 이상으로 입력해야 됩니다.`);
      }
    break;
    default:
      // 오류처리
      return Promise.reject('취소 하셨습니다.');
    break;
  }

  // 입력 정보 재 확인
  let owner = account;                    // 내 계정명 
  let orderid = Number(new Date().getTime().toString().substr(4));     // 거래 취소에 필요한 order id 유니크 해야됨, uint32 : max 4294967295
  let amount_to_sell = `${Number(amount).toFixed(3)} SBD`;   // 판매 스달량 
  let min_to_receive = `${Number(change).toFixed(3)} STEEM`; // 구매 스팀량 
  let fill_or_kill = false;               // ???
  let expiration = getNowCHour(9).toISOString().substr(0,19); // 거래 만료 시간 설정 - 기본 9시간 뒤
  console.log(`____________________________________________________________`);
  console.log(`orderid : ${orderid} ( 거래 취소 시 필요한 번호 입니다 )`);
  console.log(`SELL : ${amount_to_sell}`);
  console.log(`BUY  : ${min_to_receive}`);
  console.log(`____________________________________________________________`);

  // 계속진행할지 여부를 확인
  let go;
  [err,go] = await to(question(`교환을 진행하시겠습니까 ? ( y / n ) : `));
  if(!go){
  	// 오류처리
    return Promise.reject('취소 하셨습니다.');	
  }else{
  	if(go.toLowerCase()!='y'){
  		// 오류처리
    	return Promise.reject('취소 하셨습니다.');	
  	}
  }

  // 내부 거래소에 등록처리를 수행한다
  let register;
  [err, register] = await to(steem.broadcast.limitOrderCreateAsync(wif, owner, orderid, amount_to_sell, min_to_receive, fill_or_kill, expiration));

  if(err){
    // 오류처리
    return Promise.reject(err);
  }
  // 결과 확인
  console.log(`거래( ${orderid} ) 가 정상적으로 등록되었습니다.`)
  return Promise.resolve();
}

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

	// 3번째 : 미설정 시 기본값을 넣어준다
	if(args.length==2){
			args.push(DEFAULT_ORDER_LIMIT);
	}

	return args;
}

module.exports = (args)=>{

	// 파라미터 초기화
	args = initParams(args);

	// 입력 파라미터 유효성 검증 
	if(args.length!=3){
		console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
		help('buysteem');
		return;
	}

	let author = args[0];			// 계정
	let activekey = args[1];	// 엑티브키 
	let limit = args[2];			// hidden params - default : 10

	// 스팀 구매를 진행한다
	buysteem(author, activekey, limit).catch(e=>{
		console.log(`____________________________________________________________`);
		console.error(e);
		console.log(`____________________________________________________________`);
		console.error('거래가 실패 했습니다 - 처음부터 다시 진행 부탁 드립니다.');
		console.log(`____________________________________________________________`);
	});
};