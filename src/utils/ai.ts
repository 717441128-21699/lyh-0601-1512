import type { AnswerTone, Flashcard, StudentProgress } from '../types';

const toneTemplates: Record<AnswerTone, { prefix: string; suffix: string }> = {
  formal: {
    prefix: '关于您的问题，解答如下：\n\n',
    suffix: '\n\n如有其他疑问，请随时提问。',
  },
  friendly: {
    prefix: '你好呀！这个问题我来帮你解答~\n\n',
    suffix: '\n\n希望对你有帮助！有其他问题随时问我哦😊',
  },
  encouraging: {
    prefix: '很好的问题！说明你在认真思考👍 让我来为你详细解答：\n\n',
    suffix: '\n\n继续保持这种求知精神，你一定能学得很棒！加油💪',
  },
};

export const generateAIAnswer = (
  questionContent: string,
  tone: AnswerTone,
  referenceMaterials?: string[]
): string => {
  const template = toneTemplates[tone];
  
  const keywordResponses: Record<string, string> = {
    '列表': '列表（List）是 Python 中最常用的数据结构之一。它是有序、可变的元素集合，使用方括号 [] 定义。列表支持索引访问、切片操作、添加删除元素等操作。',
    '元组': '元组（Tuple）是 Python 中的另一种序列类型。与列表不同，元组是不可变的，使用圆括号 () 定义。元组常用于存储不需要修改的数据。',
    '函数': '函数是组织好的、可重复使用的代码块。Python 使用 def 关键字定义函数。函数可以接受参数并返回值，有助于代码复用和模块化。',
    '装饰器': '装饰器是 Python 的高级特性，本质上是一个接受函数作为参数并返回新函数的高阶函数。它可以在不修改原函数代码的情况下扩展函数功能。',
    'pandas': 'Pandas 是 Python 中强大的数据分析库，提供 DataFrame 和 Series 两种主要数据结构，支持数据读取、清洗、转换、分析等操作。',
    'flex': 'Flex 布局是 CSS3 中的弹性盒子布局模型。通过 display: flex 启用，使用 flex-direction 确定主轴方向，justify-content 和 align-items 分别控制主轴和交叉轴对齐。',
    '闭包': '闭包是指有权访问另一个函数作用域中变量的函数。形成闭包需要三个条件：函数嵌套、内部函数引用外部变量、外部函数执行完毕后返回内部函数。',
    'sql': 'SQL（结构化查询语言）是用于管理关系数据库的标准语言。常见操作包括 SELECT 查询、INSERT 插入、UPDATE 更新、DELETE 删除，以及 JOIN 连接查询等。',
    '决策树': '决策树是一种监督学习算法，可用于分类和回归任务。它从根节点开始，根据特征值逐层分叉决策，最终在叶节点得出预测结果。',
    '快速排序': '快速排序是一种基于分治思想的排序算法。选择基准元素，将数组分为小于和大于基准的两部分，然后递归排序。平均时间复杂度 O(nlogn)。',
  };

  let answer = '';
  
  for (const [keyword, response] of Object.entries(keywordResponses)) {
    if (questionContent.toLowerCase().includes(keyword.toLowerCase())) {
      answer = response;
      break;
    }
  }

  if (!answer) {
    answer =
      '这是一个很好的问题。根据课程资料中的相关内容，建议你从基础概念入手，逐步理解核心原理。如果需要更深入的解释，可以继续追问，或者老师会在方便时为你详细解答。';
  }

  let result = template.prefix + answer + template.suffix;

  if (referenceMaterials && referenceMaterials.length > 0) {
    const shuffled = [...referenceMaterials].sort(() => Math.random() - 0.5);
    const count = Math.min(Math.floor(Math.random() * 3) + 1, shuffled.length);
    const selected = shuffled.slice(0, count);
    const references = '\n\n📚 参考资料：\n' + selected.map(name => `- 《${name}》`).join('\n');
    result += references;
  }

  return result;
};

export const generateComment = (
  score: number | null,
  studentName: string,
  tone: AnswerTone
): string => {
  const actualScore = score ?? 75;

  if (actualScore >= 90) {
    const comments = {
      formal: `${studentName}同学本次作业完成优秀，正确率高，解题思路清晰，代码规范。展现了扎实的知识功底和良好的学习态度。`,
      friendly: `${studentName}这次作业完成得超棒！正确率很高，代码也写得很规范。看得出来你学习很认真，继续保持~`,
      encouraging: `${studentName}同学，你的作业完成得太出色了！🎉 正确率非常高，解题思路也很清晰。继续保持这种学习状态，你一定会越来越优秀的！`,
    };
    return comments[tone];
  } else if (actualScore >= 80) {
    const comments = {
      formal: `${studentName}同学本次作业完成良好，大部分题目解答正确，掌握情况较好。部分题目可以进一步优化解题方法。`,
      friendly: `${studentName}这次作业做得还不错哦~ 大部分题都做对了，基础掌握得挺好。有几个地方可以再改进一下，继续加油！`,
      encouraging: `${studentName}同学，作业完成得很不错！👍 大部分知识点都掌握了，继续努力，下次争取做得更好！`,
    };
    return comments[tone];
  } else if (actualScore >= 60) {
    const comments = {
      formal: `${studentName}同学本次作业基本完成，部分题目存在错误。建议加强对相关知识点的理解和练习，如有疑问及时提问。`,
      friendly: `${studentName}这次作业完成得一般般啦，有些地方还需要再加强一下。别灰心，多练习练习就会越来越好的！`,
      encouraging: `${studentName}同学，作业虽然有些错误，但你已经在进步了！💪 建议多复习一下相关知识点，有不懂的地方一定要及时问老师，相信你很快就能赶上来的！`,
    };
    return comments[tone];
  } else {
    const comments = {
      formal: `${studentName}同学本次作业完成情况不够理想，较多题目存在错误。建议认真复习基础内容，加强练习，必要时可以寻求辅导帮助。`,
      friendly: `${studentName}这次作业可能遇到了一些困难，别担心，这很正常~ 我们一起来找出问题所在，慢慢进步。`,
      encouraging: `${studentName}同学，这次作业遇到了一些挑战，但没关系，学习就是一个不断进步的过程！📚 建议从基础开始复习，一步一个脚印，老师会帮助你的，一起加油！`,
    };
    return comments[tone];
  }
};

export const calculateMasteryColor = (level: string): string => {
  switch (level) {
    case 'mastered':
      return 'bg-success-500';
    case 'learning':
      return 'bg-primary-500';
    case 'weak':
      return 'bg-warning-500';
    case 'not_started':
      return 'bg-slate-300';
    default:
      return 'bg-slate-300';
  }
};

export const getMasteryLabel = (level: string): string => {
  switch (level) {
    case 'mastered':
      return '已掌握';
    case 'learning':
      return '学习中';
    case 'weak':
      return '较薄弱';
    case 'not_started':
      return '未学习';
    default:
      return '未学习';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending':
      return '待回答';
    case 'ai_answered':
      return 'AI 已回答';
    case 'teacher_answered':
      return '老师已回复';
    case 'transferred':
      return '转老师处理';
    case 'blocked':
      return '已屏蔽';
    default:
      return status;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'badge-warning';
    case 'ai_answered':
      return 'badge-info';
    case 'teacher_answered':
      return 'badge-success';
    case 'transferred':
      return 'badge-slate';
    case 'blocked':
      return 'badge-danger';
    default:
      return 'badge-slate';
  }
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));

  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;
  return date.toLocaleDateString('zh-CN');
};

export const exportToText = (
  student: StudentProgress,
  courseName: string
): string => {
  const weakTopicsStr = student.weakTopics.length > 0 
    ? student.weakTopics.join('、') 
    : '暂无';
  
  const suggestion = student.needsHelp
    ? '建议安排个别辅导，重点关注薄弱知识点，提供额外练习材料。'
    : '学习情况良好，可以适当提供拓展学习内容，保持学习动力。';

  return `
╔══════════════════════════════════════╗
║       学员个别辅导建议报告           ║
╚══════════════════════════════════════╝

【课程名称】${courseName}
【学员姓名】${student.name}
【当前进度】${student.progress}%
【综合得分】${student.score} 分
【是否需辅导】${student.needsHelp ? '是' : '否'}

【薄弱知识点】
${weakTopicsStr}

【辅导建议】
${suggestion}

【具体建议】
1. 针对薄弱知识点进行专项练习
2. 安排 30 分钟一对一答疑时间
3. 提供相关知识卡片进行复习
4. 跟进后续作业完成情况

—— AI 课程助教 自动生成
`.trim();
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
};

export const generateRecommendations = (
  flashcards: Flashcard[],
  count: number = 5
): Flashcard[] => {
  const scored = flashcards.map((card) => {
    let score = 0;
    if (card.masteryLevel === 'weak') score += 30;
    else if (card.masteryLevel === 'learning') score += 15;
    else if (card.masteryLevel === 'not_started') score += 20;
    
    if (card.lastReviewed) {
      const daysSince = Math.floor(
        (new Date().getTime() - new Date(card.lastReviewed).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      score += Math.min(daysSince * 2, 20);
    }
    
    if (card.isStarred) score += 10;
    
    return { card, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((item) => item.card);
};
