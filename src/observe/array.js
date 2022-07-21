let oldArrayProto = Array.prototype

export let newArrayProto = Object.create(oldArrayProto)

const methods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'reserve',
    'sort'
]

methods.forEach(method => {
    //arr.push(1,2,3)
    newArrayProto[method] = function (...args) {
        //调用内部原来的方法,重写函数对原本的函数进行劫持
        const result = oldArrayProto[method].call(this, ...args)
        console.log('代理的method', method);
        //对新增的数据进行劫持处理
        let inserted 
        let ob = this.__ob__
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args
                break;
            case 'splice':
                inserted = args.slice(2)
        }
        console.log(inserted);  //新增的内容
        if(inserted) {
            ob.observerArray(inserted)
        }



        return result
    }
});