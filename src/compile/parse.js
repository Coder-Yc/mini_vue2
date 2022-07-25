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
const endTag = new RegExp(`^<\\/${qnameCapture}>`)

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
    //解析属性(先定义语句)
    let end, attr
    while (
      !(end = template.match(startTagClose)) &&
      (attr = template.match(attribute))
    ) {
      match.attrs.push({
        name: attr[1],
        value: attr[3] || attr[4] || attr[5]
      })
      advance(attr[0].length)
    }
    // console.log(end)
    if (end) {
      advance(end[0].length)
    }
    // console.log(match)
    return { startTag: match, html: template }
  }
  return { startTag: undefined, html: template }
}

export function parseHtml(template) {
  const ELEMENT_TYPE = 1
  const TEXT_TYPE = 3
  let stack = []
  let root = null
  let currentParent
  //创建一个ast树的节点
  function createAstElementNode(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null
    }
  }

  function start(tag, attrs) {
    // console.log('开始标签', tag, attrs)
    const node = createAstElementNode(tag, attrs) //创建一个ast节点
    //看一下根结点是否是空树,如果是空,就把当前节点是树的根节点
    if (!root) {
      root = node
    }
    if (currentParent) {
      node.parent = currentParent //给parent属性赋予指针指向的值
      currentParent.children.push(node) // 让父元素记住自己这个节点
    }
    stack.push(node)
    currentParent = node //currentParent为栈中的最后一个
  }
  //把文本节点放到当前节点的孩子节点中
  function textN(text) {
    // console.log('文本标签', text)
    text = text.replace(/\s/g, '')
    text &&
      currentParent.children.push({
        type: TEXT_TYPE,
        text,
        parent: currentParent
      })
  }

  function end(tag) {
    // console.log('结束标签', tag)
    stack.pop()
    currentParent = stack[stack.length - 1]
  }

  function advance(i) {
    // console.log(i)
    template = template.substring(i)
  }

  while (template) {
    //如果textEnd是0,就说明他是一个开始或者结束标签08
    //如果textEnd是大于0,就说明他是一个文本结束的标签
    //<div>Hello</div>
    const textEnd = template.indexOf('<')
    if (textEnd === 0) {
      // debugger
      const { startTag, html } = parseStartTag(template)
      template = html
      // debugger
      //解析开始的标签
      if (startTag) {
        start(startTag.tagName, startTag.attrs)
        continue
      }
      //解析结束标签
      const endTagName = template.match(endTag)
      if (endTagName) {
        end(endTagName[0])
        advance(endTagName[0].length)
        continue
      }
    }
    if (textEnd > 0) {
      // debugger
      const text = template.substring(0, textEnd)
      if (text) {
        textN(text)
        advance(text.length)
      }
    }
  }
  return root
}
