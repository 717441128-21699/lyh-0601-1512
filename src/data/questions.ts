import type { Question, ChatMessage } from '../types';

const makeMessages = (
  questionId: string,
  initialQuestion: string,
  exchanges: { role: 'student' | 'ai' | 'teacher'; content: string; time: string; authorName?: string }[]
): ChatMessage[] => {
  const messages: ChatMessage[] = [
    {
      id: `${questionId}-q`,
      questionId,
      role: 'student',
      content: initialQuestion,
      createdAt: exchanges[0]?.time || '2024-11-15 10:00:00',
    },
  ];

  exchanges.forEach((ex, i) => {
    messages.push({
      id: `${questionId}-m${i}`,
      questionId,
      role: ex.role,
      content: ex.content,
      createdAt: ex.time,
      authorName: ex.authorName,
    });
  });

  return messages;
};

export const questions: Question[] = [
  {
    id: 'q1',
    courseId: 'c1',
    courseName: 'Python 编程基础',
    studentName: '李明',
    content: 'Python 中列表和元组有什么区别？什么时候应该用列表，什么时候用元组？',
    status: 'ai_answered',
    tags: ['Python', '数据结构', '基础'],
    isBlocked: false,
    createdAt: '2024-11-15 10:25:00',
    messages: makeMessages('q1', 'Python 中列表和元组有什么区别？什么时候应该用列表，什么时候用元组？', [
      {
        role: 'ai',
        content:
          '列表和元组的主要区别在于：列表是可变的（mutable），可以随时添加、删除或修改元素，使用方括号 [] 定义；元组是不可变的（immutable），一旦创建就不能修改，使用圆括号 () 定义。列表适用于需要动态修改的数据集合，元组适用于固定不变的数据，如坐标、配置项等。',
        time: '2024-11-15 10:30:00',
      },
    ]),
    isStarred: true,
    knowledgePoints: ['列表', '元组', '数据类型'],
  },
  {
    id: 'q2',
    courseId: 'c2',
    courseName: '数据分析与可视化',
    studentName: '王芳',
    content: '老师好，请问 pandas 怎么读取 CSV 文件？有哪些常用的参数？',
    status: 'ai_answered',
    tags: ['pandas', 'CSV', '数据读取'],
    isBlocked: false,
    createdAt: '2024-11-14 14:15:00',
    messages: makeMessages('q2', '老师好，请问 pandas 怎么读取 CSV 文件？有哪些常用的参数？', [
      {
        role: 'ai',
        content:
          'pandas 中读取 CSV 文件使用 pd.read_csv() 函数。基本用法：import pandas as pd; df = pd.read_csv("file.csv")。常用参数包括：sep 指定分隔符，header 指定表头行，encoding 指定编码格式，usecols 指定读取的列等。如果文件有中文，建议使用 encoding="utf-8-sig"。',
        time: '2024-11-14 14:20:00',
      },
      {
        role: 'student',
        content: '那如果文件很大，内存不够怎么办呢？',
        time: '2024-11-14 14:25:00',
      },
      {
        role: 'ai',
        content:
          '对于大文件，可以使用 chunksize 参数分块读取：df = pd.read_csv("big.csv", chunksize=10000)，然后逐块处理。也可以只读取需要的列（usecols），或指定数据类型（dtype）来减少内存占用。',
        time: '2024-11-14 14:27:00',
      },
    ]),
    knowledgePoints: ['pandas', 'CSV读取', '数据导入'],
  },
  {
    id: 'q3',
    courseId: 'c1',
    courseName: 'Python 编程基础',
    studentName: '张伟',
    content: '请问 Python 中的装饰器是怎么工作的？能举个实际应用的例子吗？',
    status: 'transferred',
    tags: ['Python', '装饰器', '进阶'],
    isBlocked: false,
    createdAt: '2024-11-15 09:30:00',
    messages: makeMessages('q3', '请问 Python 中的装饰器是怎么工作的？能举个实际应用的例子吗？', []),
    knowledgePoints: ['装饰器', '闭包', '函数式编程'],
  },
  {
    id: 'q4',
    courseId: 'c3',
    courseName: 'Web 前端开发',
    studentName: '陈静',
    content: 'CSS 的 flex 布局是什么？能详细讲解一下吗？',
    status: 'teacher_answered',
    tags: ['CSS', 'flex', '布局'],
    isBlocked: false,
    createdAt: '2024-11-13 09:00:00',
    messages: makeMessages('q4', 'CSS 的 flex 布局是什么？能详细讲解一下吗？', [
      {
        role: 'ai',
        content:
          'flex 布局是 CSS3 中的一种弹性盒子布局模型，通过 display: flex 启用。主要概念包括：容器（flex container）和项目（flex item）。常用属性：容器有 flex-direction（主轴方向）、justify-content（主轴对齐）、align-items（交叉轴对齐）、flex-wrap（换行）；项目有 flex-grow（放大比例）、flex-shrink（缩小比例）、flex-basis（基准大小）。',
        time: '2024-11-13 09:15:00',
      },
      {
        role: 'student',
        content: '那 justify-content 和 align-items 有什么具体区别呢？能举个例子吗？',
        time: '2024-11-13 09:20:00',
      },
      {
        role: 'teacher',
        content:
          '很好的问题！简单来说：justify-content 控制的是【主轴方向】上的对齐方式，而 align-items 控制的是【交叉轴方向】上的对齐方式。举个例子：如果 flex-direction: row（默认），主轴就是水平方向，justify-content 控制水平对齐（左对齐、居中、右对齐、两端对齐等），align-items 控制垂直对齐（顶部对齐、居中、底部对齐等）。如果 flex-direction: column，主轴变成垂直方向，两者的作用就反过来了。',
        time: '2024-11-13 09:25:00',
        authorName: '张老师',
      },
      {
        role: 'student',
        content: '明白了！那 flex: 1 是什么意思呢？经常看到但不太理解',
        time: '2024-11-13 09:30:00',
      },
      {
        role: 'teacher',
        content:
          'flex: 1 是一个简写属性，相当于 flex-grow: 1; flex-shrink: 1; flex-basis: 0%。意思是：元素可以放大（grow）也可以缩小（shrink），基准大小为 0。最常见的用途是让元素平分剩余空间——比如两个元素都设置 flex:1，它们就会各占 50% 的宽度。',
        time: '2024-11-13 09:35:00',
        authorName: '张老师',
      },
    ]),
    isStarred: true,
    knowledgePoints: ['flex布局', 'CSS', '响应式设计'],
  },
  {
    id: 'q5',
    courseId: 'c5',
    courseName: '数据库原理与应用',
    studentName: '刘强',
    content: '请问内连接和左连接有什么区别？什么时候用左连接？',
    status: 'pending',
    tags: ['SQL', '连接查询', '基础'],
    isBlocked: false,
    createdAt: '2024-11-15 11:00:00',
    messages: makeMessages('q5', '请问内连接和左连接有什么区别？什么时候用左连接？', []),
    knowledgePoints: ['SQL连接', '内连接', '左连接'],
  },
  {
    id: 'q6',
    courseId: 'c4',
    courseName: '机器学习入门',
    studentName: '赵雪',
    content: '老师，什么是决策树？能简单解释一下吗？',
    status: 'ai_answered',
    tags: ['机器学习', '决策树', '算法'],
    isBlocked: false,
    createdAt: '2024-11-12 16:30:00',
    messages: makeMessages('q6', '老师，什么是决策树？能简单解释一下吗？', [
      {
        role: 'ai',
        content:
          '决策树是一种监督学习算法，可用于分类和回归问题。它从根节点开始，根据特征值逐层分叉，最终到达叶节点得到预测结果。构建过程包括选择最佳特征、计算信息增益或基尼不纯度、递归分裂直到满足停止条件。决策树易于理解和解释，但容易过拟合，可以通过剪枝来解决过拟合问题。',
        time: '2024-11-12 16:45:00',
      },
    ]),
    knowledgePoints: ['决策树', '监督学习', '分类算法'],
  },
  {
    id: 'q7',
    courseId: 'c6',
    courseName: '算法与数据结构',
    studentName: '孙磊',
    content: '快速排序的时间复杂度为什么是 O(nlogn)？最坏情况是什么？',
    status: 'transferred',
    tags: ['排序算法', '时间复杂度', '进阶'],
    isBlocked: false,
    createdAt: '2024-11-14 15:45:00',
    messages: makeMessages('q7', '快速排序的时间复杂度为什么是 O(nlogn)？最坏情况是什么？', []),
    knowledgePoints: ['快速排序', '分治算法', '时间复杂度'],
  },
  {
    id: 'q8',
    courseId: 'c3',
    courseName: 'Web 前端开发',
    studentName: '周敏',
    content: 'React 中 useState 和 useRef 有什么区别？',
    status: 'pending',
    tags: ['React', 'Hooks', '状态管理'],
    isBlocked: false,
    createdAt: '2024-11-15 10:45:00',
    messages: makeMessages('q8', 'React 中 useState 和 useRef 有什么区别？', []),
    knowledgePoints: ['useState', 'useRef', 'React Hooks'],
  },
  {
    id: 'q9',
    courseId: 'c2',
    courseName: '数据分析与可视化',
    studentName: '吴涛',
    content: 'Matplotlib 怎么画柱状图？怎么设置颜色和标签？',
    status: 'ai_answered',
    tags: ['Matplotlib', '可视化', '图表'],
    isBlocked: false,
    createdAt: '2024-11-13 11:20:00',
    messages: makeMessages('q9', 'Matplotlib 怎么画柱状图？怎么设置颜色和标签？', [
      {
        role: 'ai',
        content:
          '使用 plt.bar() 绘制柱状图。示例：import matplotlib.pyplot as plt; x = ["A", "B", "C"]; y = [10, 20, 15]; plt.bar(x, y, color="skyblue"); plt.xlabel("类别"); plt.ylabel("数值"); plt.title("柱状图示例"); plt.show()。颜色可以用 color 参数设置，支持命名颜色或十六进制颜色码。',
        time: '2024-11-13 11:25:00',
      },
      {
        role: 'student',
        content: '能画分组柱状图吗？就是每个类别有两根柱子那种',
        time: '2024-11-13 11:30:00',
      },
    ]),
    isStarred: true,
    knowledgePoints: ['Matplotlib', '柱状图', '数据可视化'],
  },
  {
    id: 'q10',
    courseId: 'c1',
    courseName: 'Python 编程基础',
    studentName: '郑丽',
    content: 'Python 的 *args 和 **kwargs 是什么意思？怎么用？',
    status: 'ai_answered',
    tags: ['Python', '函数', '基础'],
    isBlocked: false,
    createdAt: '2024-11-12 14:00:00',
    messages: makeMessages('q10', 'Python 的 *args 和 **kwargs 是什么意思？怎么用？', [
      {
        role: 'ai',
        content:
          '*args 和 **kwargs 用于函数可变参数。*args 收集任意数量的位置参数为元组，**kwargs 收集任意数量的关键字参数为字典。示例：def func(*args, **kwargs): print(args, kwargs)。调用 func(1, 2, a=3, b=4) 会输出 (1, 2) {"a": 3, "b": 4}。',
        time: '2024-11-12 14:05:00',
      },
    ]),
    knowledgePoints: ['函数参数', '*args', '**kwargs'],
  },
  {
    id: 'q11',
    courseId: 'c1',
    courseName: 'Python 编程基础',
    studentName: '测试用户',
    content: '这是一个测试问题，包含不适合的内容需要被屏蔽。',
    status: 'blocked',
    tags: ['测试'],
    isBlocked: true,
    createdAt: '2024-11-11 08:00:00',
    messages: makeMessages('q11', '这是一个测试问题，包含不适合的内容需要被屏蔽。', []),
    knowledgePoints: [],
  },
];

export const getStarredQuestions = (): Question[] =>
  questions.filter((q) => q.isStarred && !q.isBlocked);
