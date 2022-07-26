import { parseHtml } from './parse'

function genProps(attrs) {
  /**
   * 对属性做处理
   * 遍历属性的数组用一个str组成一个key:value形式的字符串
   * 其中需要对style样式做特殊处理(相当于qs库)
   * 通过;对attr做一个分割,然后对里面的:就行分割,组成key:value形式
   *
   */
  let str = ''
  // console.log(attrs)
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i]
    if (attr.name === 'style') {
      let obj = {}
      attr.value.split(';').forEach((ele) => {
        //qs库
        ele = ele.replace(' ', '')
        const [key, value] = ele.split(':')
        obj[key] = value
      })
      attr.value = obj
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0, -1)}}`
}

function genChildren(children) {
  /**
   * 对孩子节点做一个映射调用gen函数并用逗号拼接
   * gen函数返回的是tokens数组组成的render样式
   */
  if (children) {
    return children.map((child) => gen(child)).join(',')
  }
}

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
function gen(node) {
  /**
   * 判断传过来的节点类型
   * 如果是标签节点就调用codegen方法并返回
   * 如果不是就判断文件节点是master还是普通文本
   */
  if (node.type === 1) {
    return codegen(node)
  } else {
    let text = node.text
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`
    } else {
      //_v(_s(name) + 'hello' + _s(name))
      let tokens = []
      let match
      let lastIndex = 0
      // debugger
      defaultTagRE.lastIndex = 0
      /**
       * 利用正则的exec这个方法,返回一个字符串中匹配到的字符以及开始索引
       * 例如一段 '{{name}} hello {{age}} world' 这样的字符串
       * 定义一个开始的index,为匹配到的下标开始
       * 然后定义一个lastIndex,他的值是一个词的最后一个索引位置,默认也是0
       * 判断开始的索引是不是大于最后值的索引,如果是就把中间一段 hello 添加到tokens里面
       * 然后把这个字符放到token里,最后把lastIndex的值设置为开始值加上匹配到的字符串的长度
       * 最后再判断一下末尾有么有值
       */
      while ((match = defaultTagRE.exec(text))) {
        // console.log(match)
        let index = match.index
        if (index > lastIndex) {
          tokens.push(`'${text.slice(lastIndex, index)}'`)
        }
        tokens.push(`_s(${match[1]})`)
        lastIndex = index + match[0].length
      }
      if (text.slice(lastIndex)) {
        tokens.push(`'${text.slice(lastIndex)}'`)
      }
      // console.log(tokens)
      /**
       * 这里返回的是一个tokens组成的一个语句
       */
      return `_v(${tokens.join('+')})`
    }
  }
}

function codegen(ast) {
  /**
   * 这里主要是返回一个render的一个函数形式
   * 主要就是两个方面的处理属性和孩子节点
   * 1. 判断有没有属性节点,有就调用genProps方法
   * 2. 判断孩子节点长度,并调用genChildren去处理孩子节点
   *
   */
  let children = genChildren(ast.children)
  let code = `_c('${ast.tag}', ${
    ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'
  }${ast.children.length > 0 ? `,${children}` : ''})`
  return code
}

//对模版进行编译处理
export function compileToRenderFunction(template) {
  // console.log(template)
  //1. 把html转成ast树
  const ast = parseHtml(template)

  //2. 生成render方法(render方法执行后的返回结果就是虚拟Dom)
  let code = codegen(ast)

  /**
   * 模版引擎的实现原理就是with + new Function
   * with的作用就是把code里的变量作用域放到with传来的this中
   */
  code = `with(this) {return ${code}}`
  const render = new Function(code)
  // console.log(render)
  return render
}
