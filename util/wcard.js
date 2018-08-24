let fn = {};

// 프랑스식(한국) 스>다>하>클, 미국은 스>하>다>클
// see : http://koreabettingnews.com/casino/%ED%8F%AC%EC%BB%A4-%EC%A1%B1%EB%B3%B4%EC%99%80-%EC%9A%A9%EC%96%B4-%EC%97%90-%EB%8C%80%ED%95%B4-%EC%95%8C%EC%95%84%EB%B3%B4%EC%9E%90/
const CARD_T = ['♣️','♥️','♦️','♠️'];
const CARD_N = [2,3,4,5,6,7,8,9,10,'J','Q','K','A'];
const BLACKJACK = 21;
const CARD_NUM_START = 2;
const CARD_NUM_A = 14;

/*
* 카드 타입 정보
*/
fn.CARD_TYPE = {
	CLOVER : 0,
	HEART : 1,
	DIAMOND : 2,
	SPADE : 3
};

let isBackStraight = (clone)=>{
	for(let i=0;i<clone.length;i++){
		if(i<4){
			if(clone[i]._number != i+CARD_NUM_START){
				return false;
			}
		}else{
			if(clone[i]._number != CARD_NUM_A){
				return false;
			}
		}
	}
	return true;
}

let isStraight = (clone)=>{
	
	// 스트레이트 
	return clone.every((el,idx,arr)=>{
		if(idx>0){
			if(el._number==arr[idx-1]._number+1){
				return true;
			}else{
				return false;
			}
		}
		return true;
	});
}

let isFlush = (clone)=>{
	return clone.every((el,idx,arr)=>{
		if(idx>0){
			if(el._type==arr[idx-1]._type){
				return true;
			}else{
				return false;
			}
		}
		return true;
	});
}

fn.jokboCards = (cards) =>{

	// 로얄스트레이트 플러쉬 : 5장이 같은 무늬 10, J, Q, K, A 무늬는 상관없이 통일된 무늬만 있으면 된다. 숫자는 10,J,Q,K,A가 고정으로 있어여 한다.
	// 백 스트레이트 플러쉬 : 5장이 같은 무늬 A,2,3,4,5 무늬는 상관없이 통일된 무늬만 있으면 된다. 숫자는 A,2,3,4,5 고정이어야 한다.
	// 스트레이트 플러쉬 : 5장이 같은 무늬 연속되는 숫자 5장이 되야 한다. 무늬는 상관없이 통일된 무늬만 있으면 되고 시작하는 숫자 상관없이 연달아 있으면 된다.
	// 포카드 : 같은 숫자 4개 – 숫자 4개가 필요한대 각 무늬별로 1개씩 같은 숫자를 얻어야 한다. 로플티 같은 경우는 뽑을 일이 희박하지만 포카드는 확률이 있어 실질적인 가장 강력한 패라고 볼수 있다.
	// 풀하우스 : 같은숫자 3개 + 2개 – 트리플 (같은숫자3개) +원페어 (같은숫자 2개)
	// 플러쉬 : 5장 같은 무늬 – 5장 무늬만 같으면 나온다 이상태에서 스트레이트가 나오면 스티플, 로티플, 백스트가 나오는 축이라고 볼수 있다. 스트레이트가 없으면 일반적인 플러쉬라고 보면 된다.
	// 마운틴 : 10, J,Q,K,A – 무늬가 같으면 상위 족보로 간다
	// 백스트레이트 : A,2,3,4,5 – 무늬가 같으면 상위 족보로 간다
	// 스트레이트 : 연속 되는 숫자 5장 – 무늬가 같으면 상위 족보로 간다
	// 트리플 : 같은 숫자 3개
	// 투페어 : 같은숫자 2개 +2개
	// 원페어 : 같은 숫자 2개
	// 노페어 : 5장 모두 어디에도 해당 되지 않는 패

	// 일부가 .. some
	// 모두가 .. every

	// let clone = cards.slice(0);
	let clone = JSON.parse( JSON.stringify( cards ) );

	// 계산을 손쉽게 하기 위하여 복제카드는 정렬 한다(숫자기준으로)
	fn.sortCards(clone, false);

	let isBackStraight = isBackStraight(clone);
	let isStraight = isStraight(clone);
	let isFlush = isFlush(clone);

	return {
		ori : cards,
		sort : clone
	};
}

/*
* 카드에서 num 만큼의 카드를 뽑아낸다
* 입력 받은 카드는 자동적으로 num 만큼 숫자가 감소 
* @param cards 카드목록
* @param num 넘겨줄 카드 수
* @return 넘겨진 카드 목록
*/
fn.drawCards = (cards, num) => {
	let out = [];
	for(let i=0;i<num;i++){
		out.push(cards.shift());
	}
	return out;
};

/*
* 신규 카드 댁을(52장) 생성한다
* @return 52장의 카드
*/
fn.makeDeck = () =>{
	let cards = [];
	for(var i=0;i<CARD_T.length;i++){
    for(var j=0;j<CARD_N.length;j++){
      cards.push({
      	type : CARD_T[i],
      	_type : i,
      	number : CARD_N[j],
      	_number : j+2
      });
    }
  }
  return cards;
}

/*
* 입력받은 카드를 섞어준다
* @param cards 카드 목록
*/
fn.shuffleCards = (cards) =>{

	for(let i=0;i<cards.length;i++){
		let rnd = Math.floor(Math.random()*cards.length);
		cards.splice(rnd, 0, cards.shift());
	}
}

/*
* 카드 댁의 정보 기준으로 정렬한다
* @param cards 카드 목록
* @param isType 타입 우선으로 정렬할지 여부 (아니라면 숫자로 정렬)
* @param isAsc 오름차순 여부
* @return 정렬된 카드 목록
*/
fn.sortCards = (cards, isType=true, isAsc=true) =>{

	return cards.sort((c1,c2)=>{

		let s1 = isAsc?c1._type-c2._type:c2._type-c1._type;
		let s2 = isAsc?c1._number-c2._number:c2._number-c1._number;

		if(isType){
			if(s1==0){
				return s2;
			}else{
				return s1;
			}
		}else{
			if(s2==0){
				return s1;
			}else{
				return s2;
			}
		}
		
	});
}

/*
* 입력받은 카트 타입으로 카드 덱을 필터링 한다
* @param cards 카드 목록
* @param cardTypes 카드 타입 배열(CARD_TYPE.SPADE ...)
* @return 필터링된 카드목록
*/
fn.filterCardsByType = (cards, cardTypes=[]) =>{
	return cards.filter(c=>cardTypes.includes(c._type));
}

module.exports = fn;