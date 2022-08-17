/**
 * *解析template,生成一个ast树
 * *总的来说就是先用正则表达式匹配到标签,再通过栈的方式管理创建出来的节点,维持好关系
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

function parseStartTag(template) {
    //切割原本字符串
    function advance(i) {
        // console.log(i)
        template = template.substring(i)
    }
    /**
     * 正则匹配开始标签
     * 如果匹配到了,就用一个match对象装着,里面有tagName和attrs
     * 匹配玩开始标签后,删除开始标签,继续匹配属性和结束的反尖号
     * 由于可能有很多的属性,所以使用while不断去匹配,匹配到一个就删除一个,直到空
     * 然后判断是否有反尖号,如果有也删除,最后返回match
     */
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
        if (end) {
            advance(end[0].length)
        }
        return { startTag: match, html: template }
    }
    return { startTag: undefined, html: template }
}

export function parseHtml(template) {
    /**
     * 创建几个常量
     * @param ELEMENT_TYPE 标签类型
     * @param TEXT_TYPE 文本类型
     * @param stack 维护的栈保证标签之间父子关系的
     * @param root ast树的根节点
     * @param currentParent 当前活跃在栈中间的标签
     */
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
        /**
         * 当匹配到标签节点的时候,传过来匹配到的标签和属性
         * 并且通过标签和属性创建出一个ast标签节点
         * 看一下根节点是否为空,如果为空就把第一个匹配到的标签节点给root,就是根节点
         * 然后看一下当前节点是否有值,如果有值就把currentParent当作父亲给现在匹配到的儿子节点
         * 然后把当前值push到currentParent里的儿子节点
         * 最后把这个节点放到stack中,并且让currentParent指向当前这个node
         */
        const node = createAstElementNode(tag, attrs) //创建一个ast节点
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

    function textN(text) {
        /**
         * 当匹配到文本节点的时候,把文本节点放到当前节点的孩子节点中
         */
        text = text.replace(/\s/g, '')
        text &&
            currentParent.children.push({
                type: TEXT_TYPE,
                text,
                parent: currentParent
            })
    }

    function end(tag) {
        /**
         * 当匹配到结束标签的时候,把栈中的最后一个弹出,让currentParent指向栈中长度减一的值
         */
        stack.pop()
        currentParent = stack[stack.length - 1]
    }

    function advance(i) {
        /**
         * 返回切割指定长度的字符串
         */
        template = template.substring(i)
    }

    while (template) {
        /**
         * 首先解析html.找到开始的尖括号
         * 如果textEnd是0,就说明他是一个开始或者结束标签,如果textEnd是大于0,就说明他是一个文本结束的标签,就这两种情况
         * 例如<div>Hello</div>和<div></div>
         *
         */
        const textEnd = template.indexOf('<')
        if (textEnd === 0) {
            // debugger
            /**
             * 如果是一个开始或者结束标签,首先去调用parseStartTag匹配开始标签
             * 返回一个开始标签和处理过后的html模版
             * 如果有匹配到startTag,就调用start方法,这是个处理标签的方法,然后退出这次循环,继续继续匹配
             * 如果有没有匹配到startTag,就去匹配endTagName结束标签,如果有就调用end这个方法,并且删除end所占的template位置
             * 此时的推出循环时template已经是删除之后过后的
             */
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
            /**
             * 如果是文本类似于Hello</div>这样的形式
             * 就去对字符串切割,切割到textEnd的值的位置
             * 如果有值就调用textN这个文本节点方法,然后删除text
             */
            const text = template.substring(0, textEnd)
            if (text) {
                textN(text)
                advance(text.length)
            }
        }
    }
    console.log(root)
    return root
}
