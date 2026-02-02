// Sample questions for practice mode
export const sampleQuestions = [
  {
    id: 'q1',
    questionTextAr: 'تعاقب المخالفات الجسدية بــ .... ؟',
    questionType: 'MULTIPLE_CHOICE',
    options: [
      { id: 'q1-a', textAr: 'ركلة حرة مباشرة أو ركلة جزاء .', orderIndex: 0 },
      { id: 'q1-b', textAr: 'ركلة حرة مباشرة أو ركلة جزاء أو إسقاط .', orderIndex: 1 },
      { id: 'q1-c', textAr: 'ركلة حرة أو ركلة جزاء .', orderIndex: 2 },
      { id: 'q1-d', textAr: 'جميع الاجابات صحيحة .', orderIndex: 3 },
    ],
    correctAnswer: 2, // ركلة حرة أو ركلة جزاء
    explanationAr: 'المخالفات الجسدية تعاقب بركلة حرة أو ركلة جزاء حسب مكان المخالفة.',
  },
  {
    id: 'q2',
    questionTextAr: 'مهاجم يقوم بتسديد الكرة في المرمى الخالي من حارسه، حارس المرمى يقوم برمي حذائه على الكرة ليمنعها من دخول المرمى و تحقق له ما أراد ، ما قرار الحكم ؟',
    questionType: 'MULTIPLE_CHOICE',
    options: [
      { id: 'q2-a', textAr: 'ركلة حرة غير مباشرة و إنذار الحارس .', orderIndex: 0 },
      { id: 'q2-b', textAr: 'ركلة حرة غير مباشرة أو ركلة جزاء و إنذار أو طرد الحارس .', orderIndex: 1 },
      { id: 'q2-c', textAr: 'ركلة حرة غير مباشره و طرد الحارس .', orderIndex: 2 },
      { id: 'q2-d', textAr: 'ركلة حرة مباشرة أو ركلة جزاء و طرد الحارس .', orderIndex: 3 },
    ],
    correctAnswer: 3, // ركلة حرة مباشرة أو ركلة جزاء و طرد الحارس
    explanationAr: 'رمي جسم على الكرة يعتبر مخالفة تعاقب بركلة حرة مباشرة أو ركلة جزاء، ومنع فرصة محققة يستوجب الطرد.',
  },
  {
    id: 'q3',
    questionTextAr: 'أي من العبارات التالية صحيحة ؟',
    questionType: 'MULTIPLE_CHOICE',
    options: [
      { id: 'q3-a', textAr: 'المهاجمة التي تعرض سلامة المنافس للخطر تعاقب بركلة حرة مباشرة و تعتبر لعب عنيف .', orderIndex: 0 },
      { id: 'q3-b', textAr: 'إعاقة تقدم المنافس بدون تلامس تعني التحرك في مسار المنافس لمنعه أو إبطاءه أو ارغامه على تغيير مساره عندما تكون الكرة ليست في مسافة اللعب للاعبين المعنيين .', orderIndex: 1 },
      { id: 'q3-c', textAr: 'جميع الإجابات غير صحيحة .', orderIndex: 2 },
      { id: 'q3-d', textAr: 'جميع العبارات صحيحة .', orderIndex: 3 },
    ],
    correctAnswer: 3, // جميع العبارات صحيحة
    explanationAr: 'كلتا العبارتين صحيحتان وفقاً لقوانين اللعبة.',
  },
  {
    id: 'q4',
    questionTextAr: 'لاعب يرتكب خطأ مما أدى إلى منع الفريق المنافس من هدف محقق ، ما هو قرار الحكم ؟',
    questionType: 'MULTIPLE_CHOICE',
    options: [
      { id: 'q4-a', textAr: 'جميع ما ذكر يمكن أن يكون صحيحا .', orderIndex: 0 },
      { id: 'q4-b', textAr: 'يحتسب الحكم ركلة حرة مباشرة و طرد اللاعب .', orderIndex: 1 },
      { id: 'q4-c', textAr: 'يحتسب الحكم ركلة جزاء و طرد اللاعب .', orderIndex: 2 },
      { id: 'q4-d', textAr: 'يحتسب الحكم ركلة حرة غير مباشرة و طرد اللاعب .', orderIndex: 3 },
    ],
    correctAnswer: 0, // جميع ما ذكر يمكن أن يكون صحيحا
    explanationAr: 'يعتمد القرار على نوع المخالفة ومكانها، جميع الخيارات ممكنة.',
  },
  {
    id: 'q5',
    questionTextAr: 'بعد أن يسيطر الحارس على الكرة ، كم ثانية مسموح له الإحتفاظ بها ؟',
    questionType: 'MULTIPLE_CHOICE',
    options: [
      { id: 'q5-a', textAr: 'حسب تقدير الحكم .', orderIndex: 0 },
      { id: 'q5-b', textAr: '10 ثواني .', orderIndex: 1 },
      { id: 'q5-c', textAr: '9 ثواني .', orderIndex: 2 },
      { id: 'q5-d', textAr: '8 ثواني .', orderIndex: 3 },
    ],
    correctAnswer: 3, // 8 ثواني
    explanationAr: 'وفقاً للقانون، يجب على حارس المرمى التخلص من الكرة خلال 8 ثوانٍ.',
  },
  {
    id: 'q6',
    questionTextAr: 'أي من الاعتبارات التالية لا يؤخذ به عند تقدير مخالفة منع فرصة محققة لتسجيل هدف ؟',
    questionType: 'MULTIPLE_CHOICE',
    options: [
      { id: 'q6-a', textAr: 'عدد المهاجمين المشاركين في الهجمة .', orderIndex: 0 },
      { id: 'q6-b', textAr: 'إجتمالية الاحتفاظ أو السيطرة على الكرة .', orderIndex: 1 },
      { id: 'q6-c', textAr: 'الإتجاه العام للعب .', orderIndex: 2 },
      { id: 'q6-d', textAr: 'المسافة بين المخالفة و المرمى .', orderIndex: 3 },
    ],
    correctAnswer: 0, // عدد المهاجمين المشاركين في الهجمة
    explanationAr: 'عدد المهاجمين ليس من الاعتبارات المذكورة في القانون لتقدير فرصة الهدف المحقق.',
  },
  {
    id: 'q7',
    questionTextAr: 'اثناء اللعب يستأذن لاعب من الحكم للخروج خارج الملعب لأي سبب و أثناء خروجه تصله الكرة و يسجل هدفا ، ما هو قرار الحكم ؟',
    questionType: 'MULTIPLE_CHOICE',
    options: [
      { id: 'q7-a', textAr: 'يحتسب الحكم ركلة حرة غير مباشرة ضد اللاعب و إنذاره .', orderIndex: 0 },
      { id: 'q7-b', textAr: 'الحكم ينذر اللاعب و يستأنف اللعب بإسقاط .', orderIndex: 1 },
      { id: 'q7-c', textAr: 'يحتسب الحكم ركلة حرة مباشرة ضد اللاعب و إنذاره .', orderIndex: 2 },
      { id: 'q7-d', textAr: 'جميع الإجابات صحيحة .', orderIndex: 3 },
    ],
    correctAnswer: 0, // يحتسب الحكم ركلة حرة غير مباشرة ضد اللاعب و إنذاره
    explanationAr: 'لاعب خارج الملعب بإذن لا يحق له لعب الكرة، تحتسب ركلة حرة غير مباشرة وينذر.',
  },
  {
    id: 'q8',
    questionTextAr: 'متى تبدأ سلطة الحكم في اتخاذ القرارات الانضباطية ، الإنذار و الطرد ؟',
    questionType: 'MULTIPLE_CHOICE',
    options: [
      { id: 'q8-a', textAr: 'فور وصوله للملعب .', orderIndex: 0 },
      { id: 'q8-b', textAr: 'بعد الإنتهاء من إجراءات القرعة .', orderIndex: 1 },
      { id: 'q8-c', textAr: 'فور دخوله ميدان اللعب من أجل بدء المباراة .', orderIndex: 2 },
      { id: 'q8-d', textAr: 'فور وصوله لتفقد الملعب .', orderIndex: 3 },
    ],
    correctAnswer: 3, // فور وصوله لتفقد الملعب
    explanationAr: 'تبدأ سلطة الحكم الانضباطية فور وصوله لتفقد الملعب وتستمر حتى مغادرته.',
  },
]
