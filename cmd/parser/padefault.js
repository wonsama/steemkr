const {removeSpace2} = require('../../util/wstring');
const {getUrlValues} = require('../../util/wstring');
const {getHostAddr} = require('../../util/wstring');

let fn = {};

/*
* 파서 - default
* @param $ cheerio
* @param _url 링크 주소
* @param tags 기본 태그
* @param bodyCut 본문내용 cut
* @param uniqueCut 고유주소 생성용 cut
* @return 파싱된 JSON 개체정보
*/
module.exports = ($, _url, tags, bodyCut, uniqueCut)=>{

  // console.log(_url);

  // charset 때문에 인코딩이 깨지는 경우에 따른 대응
  // https://blog.datawrapper.de/colorguide :: 독일 사이트 같은데 ... 깨짐
  // 참조 charset : http://cmiscm.com/data/docs/com/cmiscm/utils/common/Charset.html
  // var response = await axios.get(query.url, { responseType: 'arraybuffer' });
  // var ctype: string = response.headers["content-type"];
  // if (ctype.includes("charset=GB2312"))
  // var data = iconv.decode(response.data, 'gb2312');
  // else
  // data = iconv.decode(response.data, 'utf-8');

	// 기본적으로 open graph 에서 정보를 가져온다 
  let title = $(`meta[property='og:title']`).attr('content'); // open graph
  let body = $(`meta[property='og:description']`).attr('content'); // open graph
  let image = $(`meta[property='og:image']`).attr('content'); // open graph
  let url = $(`meta[property='og:url']`).attr('content'); // open graph

  // console.log('title', title);

  if(!title&&!body&&!image&&!url){
    // steemit 은 property 가 아니라 name 으로 되어 있음 -_-;
    title = $(`meta[name='og:title']`).attr('content'); // open graph
    body = $(`meta[name='og:description']`).attr('content'); // open graph
    image = $(`meta[name='og:image']`).attr('content'); // open graph
    url = $(`meta[name='og:url']`).attr('content'); // open graph
  }

  // 주소 정보가 없는 경우 입력받은 주소로 대체
  url = url?url:_url;
  let unique = getUrlValues(url, true).substr(0,uniqueCut);

  tags = removeSpace2(tags).split(',');		// string => array
  tags.push(getHostAddr(url).replace(/\./gi,'-'));

  return {title:title, body:body, url:url, tags:tags, image:image, unique:unique?unique:'err'};
}