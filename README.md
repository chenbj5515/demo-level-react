# demo-level-react

# 前言

这个仓库(https://github.com/chenbj5515/demo-level-react)
中我们会一步一步实现一个demo级的React，没有任何的技术上的新意与花样，仅供自己以及和自己一样的React初学者初步了解React的工作原理使用。

我们的目标：

- [ ]  清晰化vNode的基本结构以及JSX是如何转为vNode的(stage-0)
- [ ]  把vNode树render为真实DOM(stage-1, stage-2)
- [ ]  在上一个的基础上支持更新、删除节点的操作(stage-3,stage-4)
- [ ]  在上一个的基础上支持函数式子组件(stage-5)
- [ ]  在上一个的基础上支持函数式子组件的useState等hooks api
- [ ]  在上一个的基础上支持diff算法

本项目的代码大部分参考了https://pomb.us/build-your-own-react/这篇文章中的代码，感谢Rodrigo Pombo为社区提供的优质内容。

# 从JSX到vNode

```tsx
// jsx
<div id="foo">
  <a>bar</a>
  <b />
</div>
```

```
// 经过babel处理变为函数调用
DemoLevelReact.createVNode(
  'div',
  {id: 'foo'},
  DemoLevelReact.createVNode(
    'a',
    null,
    'bar'
  ),
  DemoLevelReact.createVNode(
    'b',
    null,
    null
  )
)
```

```
// 最终变为vNode树
{
  type: 'div',
  props: {
    id: 'foo',
    children: [
      {
	type: 'a',
	props: {
	  children: [
	    {
	      type: 'TEXT_ELEMENT',
	      props: {
		  nodeValue: 'bar',
		  children: []
	      }
	    }
	  ]
	}
      },
     {
	type: 'b',
	props: {
		children: []
	}
     }
    ]
  }
}
```

通常来说，我们项目是通过@babel/preset-react这个插件合集来引入了babel用来转译jsx的包，实际上babel会默认转译为React.createElement这个函数调用而不是我们上面示例中写的createVNode这个函数，这也是为什么我们一个tsx文件明明没有显示用到React，但是确必须引入的原因。

不过babel提供了通过注释的方式更改调用的函数名字的机制

```tsx
// 这样我们就可以使用自己定义的方法啦

/** @jsx DemoLevelReact.createVNode */
const element = (
    <div id="foo">
        <App />
        <a>bar</a>
        <b />
    </div>
)
```

# 把vNode树render为真实DOM
vNode树是我们执行完渲染函数就有的，把vNode初次渲染为DOM仅仅是一个遍历创建DOM的过程，略过不表。（stage-1）<br>

## 时间切片
我们重点说下stage-2，stage-2中我们没有像老版本React那样全量创建、更新整个vNode树，因为每次都全量，尤其是首次全量创建的过程的会占用JS的单线程，有的场景下会有性能问题。
所以我们会像新版本React那样进行时间切片，每次渲染都会一个一个地将vNode树上的节点转为一个Fiber，如果浏览器有高优任务则把执行权交给浏览器，空闲了再继续转化vNode树上剩余的节点。

## fiber的结构
### 关系属性
一个Fiber的结构和vNode类似，只不过每个fiber会维护parent, sibling和child三个亲属fiber，用于遍历树，如图：
![alt fiber-tree](./src/diagram/fiber-tree.png)
这三个属性的获取当然是通过遍历vNode来的。

### effectTag
另外，fiber上还会带有如何更新DOM的信息.<br>
简单地说，如果树上的等位节点都是div标签，那么fiber上就会带有UPDATE的tag,最终更新DOM时会保留原有DOM，仅会更新属性和事件.<br>
如果等位上不存在旧fiber，那么就会给fiber打上PLACEMENT的tag，最终会创建新的DOM.<br>
而如果等位上存在老的没有新的fiber, 那么就会给老的fiber打上DELETE的tag, 最终会删除这个DOM.<br>

## fiber的遍历
fiber的遍历顺序看图就明白了, 用语言描述的话就是先return child，到底了就return sibling，没有sibling了就先找到parent后找return parent的sibling，直到parent也没有了就return null结束。
![alt fiber-order](./src/diagram/fiber-order.png)

# 函数式组件
## 最简实现
最简单的函数式组件形如：
```
const Child = () => (
    <div>child</div>
);

const App = () => (
    /** @jsx React.createVNode */
    <div>
        <p>bar</p>
        <Child />
    </div>
);
```
我们先来看看在babel会如何处理函数式组件：
```
// 经过babel处理变为函数调用
React.createVNode(
  'div',
  {},
  React.createVNode(
    'p',
    {},
    'bar'
  ),
  React.createVNode(
    () => /* @__PURE__ */ React.createVNode(
      'div',
      {},
      'child'
    ),
    {},
    []
  )
)
```
可以看到，babel处理函数式组件时，会把组件函数本身作为type参数传入。也就是说，函数式组件时，type字段就不是一个标签的字符串了，而是组件函数本身。
我们也可以维持createNode函数不变，仅仅不过是vNode树中节点的type字段可能是函数而已。<br>
那么fiber树呢？<br>
这里我们的处理是把函数组件本身也作为一个fiber节点，只不过这个节点的dom字段为null，而函数组件返回的vNode，我们还是处理为正常的fiber并且挂到组件fiber的child字段上。<br>
在这个最简例子里，就是Child组件中的div标签对应的fiber会是组件fiber的child。<br>
其实有组件情况下整个fiber树和正常的fiber树基本没什么区别。
我们在处理上的区别只有：<br>
1.处理组件的fiber时，props中是没有children的，需要执行type方法获取到child交由reconcileChildren函数处理<br>
2.组件fiber没有dom，所以在最终创建、更新、删除dom时，parentDom要向上找，删除的dom则要找child
## Hook的实现
### 第一个useState
```
import React, {useState} from './demo-level-react';

const Child = () => {
    const [count, setCount] = useState(0);

    function hanldeClick() {
        setCount(count => count + 1);
    }

    return (
        <div>
            <div onClick={hanldeClick}>点我add count</div>
            {count}
        </div>
    )
}
    
/** @jsx React.createVNode */
const App = () => {
    console.log('根部rerender');
    
    return (
        <div>
            <p>bar</p>
            <Child />
        </div>
    )
}
  
const container = document.querySelector('#root');

container && React.render(<App />, container);
```
我们首先实现这个最简单的useState的case(stage-6)<br>
要实现这个功能，有两个关键点：<br>
1.setState时如何拿到上一次的状态？<br>
2.拿到上一次状态后如何触发更新？<br>
首先第一个问题，我们的答案是把状态放到fiber节点上，用一个数组存储住每一次的状态：
```
export type TAction<T> = (state: T) => T;

export interface IHook<T> {
    state: T;
    queue: TAction<T>[];
}

export interface IFiber<T = any> {
    // 其他无关属性省略
    hooks?: IHook<T>[];
}
```
每次取hooks列表中最新的state就是上次的state<br>
至于如何触发重新渲染，我们之前的渲染就是重新生成wipRoot, 把alternative指向currentRoot, 然后重新生成一遍fiber tree，生成中会和prevFiber做对比，看看是更新还是创建dom。<br>
但这样肯定不是我们想要的，因为的更新维度是整个组件树了，而我们知道React中一个组件中setState只会更新组件子树。<br>
所以我们就重新生成一遍组件子树范围内的fiber tree:<br>
1.我们能在hook内拿到组件的fiber, 那么先把组件fiber的alternative设为自身.这样才能保证是更新而不会创建新的组件<br>
2.通过performUnitOfWork方法生成新的整个子树的fiber，在这个过程中我们会重新执行type方法->重新执行函数式组件->拿到最新的hook state->产生新的vNode->产生带有新dom的fiber<br>
3.最终我们提交组件子树，把fiber转为真实的dom<br>
