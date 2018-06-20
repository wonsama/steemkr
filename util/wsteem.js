let fn = {};

/**
* 스팀, 스달에서 값 정보만 추출
* @param source 입력값 (2개 이상인 경우 합산처리)
* @return 추출된 값 (4자리로 맞춰)
*/
fn.getMoney = (...source)=>{
  try{

    let sum = 0;
    for(let m of source){
      sum+=Number(m.split(' ')[0]);
    }
    return Number(sum.toPrecision(4));

  }catch(e){
    return 0;
  }
}

/*
* 주소 정보에서 유용한 정보를 추출한다
* @param 주소창의 주소
*/
fn.getInfoFromLink = (link)=>{

	// https:// 부분은 cut
  // 이후 구성 [ 도메인 - 태그 - 저자 - 펌링크 ]
  let infos = link.substr(8).split('/');

  if(!infos || infos.length!=4){

  	let msg = [];
  	msg.push(`입력받은 ${link} 는 올바른 주소 형식이 아닙니다.`);
  	msg.push('sample link : https://steemit.com/kr/@wonsama/kr-dev-krob');

  	return {
  		data:{
  			domain: '',
		  	category: '',
		  	author: '',
		  	permlink: ''
  		},
  		ok:false,
  		cd:999,
	  	msg:msg.join('\n')
	  }
  }

  return {
  	data:{
  		domain: infos[0],
	  	category: infos[1],
	  	author: infos[2].substr(1),
	  	permlink: infos[3]
  	},
  	ok:true,
  	cd:0, /* 0 : 정상, 양수 : 비정상, 추후 코드별 분기(로컬라이징, 코드메시지) 필요 */
	  msg:'success'
  }
}

module.exports = fn;