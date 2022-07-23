/**
 * *解析template,通过正则表达式
 *
 */
const naname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${naname}\\:)?${naname})`
//它匹配的是一个标签名
///^<((?:[a-zA-Z_][\-\.0-9_a-zA-Z]*\:)?[a-zA-Z_][\-\.0-9_a-zA-Z]*)/
const startTagOpen = new RegExp(`^<${qnameCapture}`)
//它匹配到的是一个结束标签,多了个转义
///^<\/((?:[a-zA-Z_][\-\.0-9_a-zA-Z]*\:)?[a-zA-Z_][\-\.0-9_a-zA-Z]*)/
const endTag = new RegExp(`^<\\/${qnameCapture}`)

//第一个分组就是属性的key 第三四五就是它的value
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^'])'+|([^\s"'=<>`]+)))?/

//匹配结束标签
const startTagClose = /^\s*(\/?)>/

//匹配到内容
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

//对模版编译处理
function parseStartTag(template) {
  //切割原本字符串
  function advance(i) {
    // console.log(i)
    template = template.substring(i)
  }
  //解析开始标签
  const startTag = template.match(startTagOpen)
  if (startTag) {
    let match = {
      tagName: startTag[1],
      attrs: []
    }
    // debugger
    advance(startTag[0].length)
    console.log(template)
    //解析属性(先定义语句)
    let end, attr
    while (
      !(end = template.match(startTagClose)) &&
      (attr = template.match(attribute))
    ) {
      match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] })
      advance(attr[0].length)
    }
    console.log(end)
    if (end) {
      advance(end[0].lengt)
    }
    console.log(match)
    return match
  }
  return false
}

function parseHtml(template) {
  while (template) {
    //如果textEnd是0,就说明他是一个开始或者结束标签
    //如果textEnd是大于0,就说明他是一个文本结束的标签
    //<div>Hello</div>
    const textEnd = template.indexOf('<')
    if (textEnd === 0) {
      parseStartTag(template)
      break
    }
  }
}

//对模版进行编译处理
export function compileToRenderFunction(template) {
  // console.log(template)

  //1. 把html转成ast树
  const ast = parseHtml(template)
}
