let fn = {};

/*
* 범위 내에서 랜덤하게 섞인 숫자 배열을 반환한다
* @param max 최대값
* @param min 시작값 / 기본 1
* @return 랜덤하게 섞인 숫자 배열값
*/
fn.mixnum = (max, min=1)=>{
	let nums = [];

	// init
	for(let i=min;i<=max;i++){
		nums.push(i);
	}

	// shuffle
	for(let n of nums){
		let num = nums.shift();
		let rnd = Math.floor(Math.random()*nums.length)+1;
		nums.splice(rnd,0,num);
	}
	return nums;
}

/*
* 배열을 mod 개로 나눈 이후 idx 번째 요소만을 추출한다
* @param mod 나눌 개수
* @param idx 추출할 인덱스
* @return 배열요소
*/
fn.getModNums = (nums, mod=2, idx=0)=>{
	let out = [];
	for(let i=0;i<nums.length;i++){
		if(i%mod==idx){
			out.push(nums[i]);
		}
	}
	return out;
}

module.exports = fn;