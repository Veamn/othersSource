const axios = require('axios')
const cheerio = require('cheerio')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)
axios.defaults.headers.common['Cookie'] = "EGG_SESS=i5zf542Hv3BQTf6rvkatylGZTB9y9tRRilQAyXXKYzak39BOCAiCYGDKsNs1tiAYzx1c7LY3j_xUDUlBh6je4FH3I8sk0Rr70vL6AhKAvWEl9ZS-h5msE8Emncq8rcQeGTw_XSK0RRrvlFYs3rBBsSesC9dNqy8ztpHWLiXAjQrfmEgvFoetc2sHHlJg2H6R7okBwso83QgcOmD_QygS7Xw-eDGjBFizXQAVyhky-2al-uuXzI_lWpi9nHUrtqLB69HCneBpmy6kzDQNRRbUuCSfHRPHB-TGcU3-syf8Qm0P7-HKYN8YJK3ov8BTRa31SIHgdqGbiglb-Bo4QzsPhLWC5bM58_W-o9QnzevmfGf9COKtwRMveR_C39K32hXYw4z2VOj0KNE7kQxZ3TGwhyXA9x4_I9lzCaUcEd3AKEjrCawpMhGJkbJXMUymoZ-_p1Zl63NBzBbvzGHkiXtq_kYvMjKDPZBr7XnePqsfu8pNc35RSi-VB7mFq8lUkuIaZtvy1XYiAqlxy069NtayJNlnZSr7S0Kpxxi-virW9RgqUVYS1Daw6z8JHaUEvA_PT6y0iMTkxI7VZZpCn_i4qxuwZprUYxJfaALR6gWq1-j43RvHjUALH-ZNtHXv4RTXVmIluZxi5eonWQ9e80FPj7xVxTTL0Xk_KUsPgejiLHRbxYQmMUMy1atVVkSGtqmcru38LgWN5Z_6rtwRry1zFU8wajFNuaaGekYIOA1ZCbM1k3aK1U9DWFgx0fQ6y5rEpF-Yjfk0F_nfmvlOuXLe9RcbRH8oMTUU5ybWP12pOhYEiE9hvPWBN5-4WYlmnZAFhPaRUBriw-LiC15uOTvpDJlMyQPiYHSuhIhpGp3yHhSQ_K2E8opK1sh-UtPqN_xM4uvCvzt5yhubEa7L64EcfdNR1qsZs4QSaokNzGPmQrtraPTXFCx6mWJFr54PooJEzqnZJhumEwDydc82nINdHVvg7PsVAmlhinjQBYZpJZCLgGZZnXBxkPc4LPg25gzveDP5Kuy0-Oc3DXrv4vq9Vg==;";

async function getVideoInfo(url){
  const index = url.match(/\/(\d+)$/)[1]
  const resp = await axios.get(url)
  const $ = cheerio.load(resp.data)
  return {
    title: index+"."+$('h1').text().trim().replace('\n      \n        最终章',''),
    src: "https:"+$('source').attr('src')
  }
}

// async function getCourseInfo(url){
//   const resp = await axios.get(url)
//   const $ = cheerio.load(resp.data)
//   const title  = $('h4').text().trim().replace("NodeLover",'')
//   const subTitle = $('h6').text().trim()
//   const uptime = $('.info li').eq(0).text().match(/： (.+)$/)[1]
//   const isVip = $('.info li').eq(1).text()==='类型：会员课程'
//   const type = $('.info li').eq(2).text().match(/：(.+)$/)[1]
//   const length = parseInt($('.info li:last-child').text().match(/\d+/)[0])
//   const video = []
//   for(let i = 1;i<=length;i++){
//     video.push(await getVideoInfo(url+"/"+i))
//   }
//   return {
//     title,subTitle,uptime,isVip,type,length,video
//   }
// }

async function getCourseList(url){
  const resp = await axios.get(url)
  const $ = cheerio.load(resp.data)
  const course = []
  $('li.course-item').each(async (i,elem)=>{
    var tmp = $(elem)
    const link = tmp.find('.link').attr('href')
    const title = tmp.find('.link').text().trim()
    const isVip = tmp.find('.course-type').hasClass('vip')
    const desc = tmp.find('.desc').text().trim()
    const length = parseInt(tmp.find('.is-pulled-right').text().trim().match(/\d+/)[0])
    const type = tmp.find('.subtitle small').eq(0).text().replace('课程分类：','')
    const uptime = tmp.find('.subtitle small').eq(1).text().replace('发布时间：','')
    const video = []
    for(let i = 1;i<=length;i++){
      video.push(await getVideoInfo('https://nodelover.me'+link+"/"+i))
    }
    saveCourse({
      link,title,isVip,desc,length,type,uptime,video
    })
  })
  // console.log(course)
}

async function saveCourse(info){
  db.get('course')
  .push(info)
  .write()
  // console.log(info)
}
async function main(){
  db.defaults({ course: [] })
  .write()
  const url = "https://nodelover.me/courses"
  getCourseList(url)
}
main()