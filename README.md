# demo-level-react

# 前言

## What
一个极简版的React，为了帮助自己和他人从代码层面上理解React，而不用花大量时间去翻阅React源码。

## Why
1. 我觉得从别人的极简React代码或自己写一个极简的React是最快的学习React的方式
2. 社区中有不少类似的内容，但我没有找到完全满足我需求的<br>
a. Rodrigo Pombo的[build my own react](https://pomb.us/build-your-own-react/)非常棒，但是内容还是太少了。比如hook的实现不完整，也没有很重要的diff算法、事件系统等。<br>
b. [fre](https://github.com/yisar/fre)这个项目完成度很高，不过它是类React的框架而不是极简的React。它不是做减法，而是在React的基础上玩自己的想法。而我想要的是尽可能地掌控React，从而可以避免写bug，快速debug，写出性能更佳，符合React理念的代码——而不是造一个糅合了过多自己想法的玩具，即使那很酷。<br>
c. 还看过一个仓库，里面把React的大部分源码基本直接搬过来，加注释然后跑起来。这样的话对我而言理解效率还是太低了，毕竟作为最主流的用于生产的框架，React源码里有太多不太重要的细节了。

我们的目标：

- [ ]  清晰化vNode的基本结构以及JSX是如何转为vNode的(stage-0)
- [ ]  把vNode树render为真实DOM(stage-1, stage-2)
- [ ]  在上一个的基础上支持更新、删除节点的操作(stage-3,stage-4)
- [ ]  在上一个的基础上支持函数式子组件(stage-5)
- [ ]  在上一个的基础上支持函数式子组件的useState等hooks api(stage-6)
- [ ]  在上一个的基础上支持diff算法（stage-8）
- [ ]  加上调度机制
- [ ]  加上事件系统

# 一切的源头——JSX
JSX是我们开发者给React最主要的输入。
## jsx的分类
JSX可以分为两种：1.组件jsx 2.普通的element jsx。<br>
组件jsx最常见的就是项目根目录里的`<App />`;<br>
普通的element jsx就是`<div id="foo"></div>`这种啦;
## jsx的生命周期
最简洁的表示：jsx -> 函数调用 -> vNode<br>
下面一个一个问题地阐述：
### jsx是怎么变成函数调用的呢？
首先我们的代码都是会经过babel转译的，React的项目中，babel都会配置一个转译jsx插件，这个插件会把我们代码的中jsx都转化为函数调用：

```
// jsx
<div id="foo">
  <a>bar</a>
  <b />
</div>
```

```
// 经过babel处理变为函数调用
React.createElement(
  'div',
  {id: 'foo'},
  React.createElement(
    'a',
    null,
    'bar'
  ),
  React.createElement(
    'b',
    null,
    null
  )
)
```
### 如何转化为函数调用的？
转化的过程就是：babel的插件分析jsx的AST（抽象语法树），转化成React.createElement这个React的内置函数的调用<br>
至于函数的参数，也是babel根据用户书写的jsx通过AST分析获得的，规律大概就是标签名作为第一个参数，所有属性转译成对象作为第二个参数，所有的child以剩余参数的形式进行递归调用。如上图<br>
### 组件jsx的type参数是什么？
我们之前不是说了jsx还有组件jsx吗？那`<App />`这种的第一个参数是什么呢？
这个答案很简单但很重要，这时第一个参数会变成组件函数本身而不再是标签名了。<br>
### React的createElement函数是怎样实现的呢？
实际上很简单，仅仅将收到的参数整合成一个对象并返回，返回的这个对象就是vNode。只不过需要注意的是，转化函数实际上一共有会生成三种可能的vNode，下面在vNode章节会详细阐述这三种vNode。
### 当遇到Text Element时，babel插件会如何处理？
对于text element如这个“bar”，不会再开启函数调用把结果作为参数传入，而是直接传入了文本字符串
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
具体的代码见stage-0，你可以自己跑起来看看jsx的转译结果。<br>
另外，我们项目是通过@babel/preset-react这个插件合集来引入了babel用来转译jsx的包，实际上babel会默认转译为React.createElement这个函数调用而不是我们上面示例中写的createVNode这个函数，这也是为什么我们一个tsx文件明明没有显示用到React，但是确必须引入的原因。

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

# vNode

## vNode分类
之前说的jsx分为两类，而vNode分为三类：
1. 普通的vNode，就是普通的标签，如div标签.特征就是type为标签名
2. 纯文本，如上面例子中a标签中的文本bar.可以看到它是普通jsx的子元素.特征是type为特殊标识TEXT_ELEMENT
3. 函数的vNode，就是函数jsx转化成的vNode.特征是type为组件函数

# 从vNode到fiber

## vNode和fiber的联系与不同？
vNode和fiber都是一个描述UI的树结构的对象，那么为什么有了vNode还需要fiber，它们的区别在哪里呢？<br>
首先vNode这颗树上的UI信息是不全的。比如我们项目中的App是入口，我们的业务jsx都是在App的后代函数里。但是我们这些业务jsx对应的vNode是在根vNode上是没有的，因为这些信息是App组件函数的返回结果，而组件函数是根vNode的type的值。这意味着什么？意味着如果不执行这个type函数，根vNode上就拿不到整颗树上的所有后代。<br>
到这里我们可以得出一个结论，React语境下，vNode树仅仅是某个子树，fiber树才是整个应用的树。

## fiber的结构
每个fiber会维护parent, sibling和child三个亲属fiber，用于遍历树，如图：
![alt fiber-tree](./src/diagram/fiber-tree.png)
这个结构的建立当然是通过遍历vNode来的。

## fiber的分类
我们之前说了，vNode分为三类（普通标签，纯文本和组件），那么fiber分几类呢？我把fiber分为四类：
1. 组件fiber，和组件vNode对应
2. 纯文本fiber，和纯文本vNode对应
3. 子元素是纯文本的fiber，对应这种vNode: `<div>hello world!</div>`
4. 子元素不只是纯文本的普通fiber：`<div id="foo"><a>bar</a><b /></div>`、

## fiber的建立
这个小节我们已下面代码为例梳理下首次创建过程中fiber树的建立：<br>
```
const App = () => (
  <div id="foo">
      <a>bar</a>
      <b />
  </div>
)
```
fiber当然是根据vNode建立的，在初始时我们仅有`<App />`对应的vNode，我们根据这个vNode，创建了组件fiber，然后执行type函数，得到了组件函数的返回的jsx转译成的vNode，这个vNode通常来说和例子一样是一个普通的vNode(也有可能是fragment或纯文本)。<br>
我们把再基于vNode创建对应类型的fiber，然后把newFiber作为App组件fiber的child.<br>
这一步我们就可以继续处理这个child fiber(即id为foo的div标签对应的fiber)，它的children的第一项是a标签，第二项是b标签。<br>
其中a标签作为长子是#foo标签的child，而b标签作为次子，是fiber a的sibling。至此fiber树建立完毕。<br>

## fiber的遍历
为什么要谈fiber的遍历呢？因为fiebr树的建立并不是像我们上面例子中那么简单的，实际上的业务代码jsx都会很复杂。比如下面的例子，确认了#c1是#foo的child，#c2是#c1的sibling之后，是先处理fiber a还是先处理fiber b呢？所以我们需要说明下React中fiber树遍历的顺序。
```
<div id="foo">
    <div id="c1">
      <a>bar</a>
    </div>
    <div id="c2">
      <b />
    </div>
</div>
```
顺序本身就很简单：有子就子优先，没子就找有兄弟的祖先。<br>
这个例子中的话，顺序就是：#foo->#c1->a->#c2->b

## fiebr树转化为dom树
我们写jsx当然是要能生成DOM了，现在jsx->vNode->fiber，那么最后是如何转化为dom的呢？<br>
这个过程中分为两步：
1. 创建DOM，这件事是在创建fiber后，处理这个fiber时做的。
2. 把DOM关联到DOM树上。
a. 在首次创建时，所有的fiber都会被打上PLACEMENT的标签。<br>
b. 而我们最终在创建完fiber树后会遍历一遍fiber树，把所有带有PLACEMENT标签的fiber的DOM都作为其父元素的最后一个child（即appendChild操作）

## fiber的flags属性
上面提到了创建过程中所有fiber都会被打上PLACEMENT标签，这决定了最终提交阶段fiber的DOM会被如何操作。这个打标签从代码上来说就是fiber的flags属性被设置为PLACEMENT这个语义对应的数字。而实际上，PLACEMENT是双重语义，它不仅仅是创建，还可以代表移动。而flags也还有其他的可能值。这些我们下面会讲到。

## fiber树的更新
上面已经论述了如何创建一个fiber树并最终转为真实的DOM，下面说下fiber树的更新。
### 如何触发fiber树的更新？
我们在函数式组件中，通过useState/useReducer两个函数返回的setState/dispatch来实现更新操作。<br>
开发者关心的更新其实是dom更新、state更新和effect的执行这些，而这一切的前提都是fiber树的更新。<br>
首先我们首次创建时，整个应用的fiber树建立后会一直在内存中保存着。而setState/dispatch更新的是函数式组件对应的fiber子树。<br>
我们知道函数组件对应着一个fiber，而函数组件本身是这个fiber的type属性。当执行setState/dispatch后，type函数会被重新执行一次，函数return的vNode会基于上面state的最新值重新生成。从而fiber会基于最新的state重新生成。<br>
而更新和创建不同的地方在于，我们需要尽可能地沿用之前的DOM以减小性能开销，而不能和创建一样，所有DOM都重新创建和插入，那样的话性能可想而知会奇慢无比。<br>
所以我们就需要根据新vNode和旧fiber进行比较->得到带有不同标签的新fiber->从而以尽可能精简的DOM操作来完成更新。这个过程就是前端领域常说的diff算法。

### React的右移diff算法
diff算法属于比较复杂的点，但好在和Vue3双端比较+lis算法比起来，React的右移算法属于是“大道至简”了。<br>
首先分析下基本盘，要实现尽可能地减少dom操作这个目标，其实就两件事：
1. 沿用。先判断是否能沿用，对等位对应的旧fiber的dom的type和key属性和新的做比较，如果都相等，那么就直接沿用过来，如果上面的属性、事件等如有增删改就增删改就完事。这样避免了重新创建DOM和绑定DOM的花销。
2. 移动。仅仅有沿用是不够的，因为仅仅判断等位的旧fiber的DOM能否沿用是不能覆盖日常使用场景的，比如原来是#foo下有abcd四个子元素，而更新后顺序变为了acbd。其中b和c仅仅是调换了下位置而已，但仅仅等位判断沿用的话就需要重新创建c和b两个节点了。所以还需要算法能识别这种节点移动的情况。<br>
React的diff算法对移动的判断可以用两个字来描述，就是“右移”。再补充一下就是：只有相对位置右移的节点需要移动，左移的节点无需移动。<br>
以上面的abcd->acbd的例子来说就是，b的相对位置右移了需要移动，c的相对位置左移了无需移动。<br>
落实到代码上来说，React源码中有lastPlacedIndex、oldIndex和newIndex三个变量。<br>
其中oldIndex和newIndex容易理解，newIndex就是当前节点在新children中的索引，oldIndex为该节点在旧children中的索引。<br>
比如节点c，其newIndex为1，oldIndex为2。而lastPlacedIndex描述起来会绕一点，它表示上一个不用动的节点在oldIndex中的索引。<br>
还是abcd->acbd，我们逐个遍历新children：
    * a lastPlacedIndex初始为0, 对应的oldIndex为0。相等，说明a无需移动
    * c lastPlacedIndex仍为0, 对应的oldIndex为2。oldIndex > lastPlacedIndex，说明旧的相对关系没问题，c无需移动。根据语义，lastPlacedIndex要更新为2。
    * b lastPlacedIndex为2, 对应的oldIndex为1。oldIndex < lastPlacedIndex，说明旧的相对关系不满足新的顺序了，b要被标记为移动。
    * d lastPlacedIndex为2, 对应的oldIndex为3。oldIndex > lastPlacedIndex，说明旧的相对关系没问题，d无需移动。根据语义，lastPlacedIndex要更新为3。

我们总结下，因为是从左往右遍历新节点，所以表示新节点的旧索引的oldIndex在大于oldPlacedIndex时说明旧的相对位置就是符合新排列顺序的，就无需移动。而反之说明旧的排列无法满足新的需求，需要移动。<br>
以上其实这些只是为了更了解React的源码，其实从更抽象的层面上来思考非常简单。我们一眼就看到只有b右移了需要移动，所以b会被标记上PLACEMEMT的就标记。<br>
最终提交阶段我们逐个遍历new children，遍历到a和c的时候仅仅需要增删改DOM的属性、事件，到了b节点的时候，我们只需要在同样的增删改后，用DOM的insertBefore api，把b插到c的nextSibling即d前面就完成了移动操作。最后就是增删改d。这样就是最少而优的DOM更新操作了。<br>
当然React的右移算法和Vue3的的双端比较+lis算法比最终的DOM操作的合理性的话是完爆的。如abcd->dabc，React的diff算法会傻傻地移动三个节点，而Vue3的算法则能符合预期地只移动一个节点。<br>
不过这个仓库的目的是学习React而不是研究React的缺陷，所以diff算法相关内容不再赘述，感兴趣的可以看这篇文章（还没写，先挖个坑）。
