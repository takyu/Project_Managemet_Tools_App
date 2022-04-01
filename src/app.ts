// Project Type
enum ProjectStatus {
  Active,
  Finished,
}
class Project {
  constructor(
    public id: number,
    public title: string,
    public description: string,
    public monday: number,
    public status: ProjectStatus
  ) {}
}

type Listener<T> = (items: T[]) => void;

/**
 * グローバルなオブジェクトを定義して、アプリケーションの状態を管理する
 *
 * そしてその状態の変化を監視して、ProjectInput に入力されサブミットされた時、
 * ProjectList にプロジェクトを挿入したりする。
 *
 * アプリケーション全体の状態を管理するために、
 * 生成されるステートメントは一つであることを保証したい
 * → シングルトンパターンで実装
 */
class State<T> {
  /**
   * 何か状態に変化があった時、実行されるリスナー
   *
   * listeners のプロパティにつまり、listeners の関数に登録する際の引数の型
   * を柔軟に持たせたい
   * → Generics を使用
   *
   * また、継承先のクラスでも使えるようにするために、アクセス修飾子を protected に
   */
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

// Project State Management
class ProjectState extends State<Project> {
  /**
   * 変数をクラスのオブジェクトとして使いたい時に、クラス名を型に書いて宣言できる
   */
  private projects: Project[] = [];

  // Singleton
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  // addListener(listenerFn: Listener) {
  //   this.listeners.push(listenerFn);
  // }

  /**
   * ProjectInput クラスからサブミットされて、addProject が実行され、
   * その後、ProjectList クラスの実行中プロジェクトに挿入したい
   */
  addProject(title: string, description: string, manday: number) {
    const newProject = new Project(
      this.projects.length + 1,
      title,
      description,
      manday,
      ProjectStatus.Active
    );
    this.projects.push(newProject);

    /**
     * 追加後に listener 関数を一通り実行
     *
     * 初回読み込み時に、projectList クラスのコンストラクタ関数において、
     * projectList の assignedProjects[] にオブジェクトの参照がコピーされ
     * それを描写するメソッドを実行する関数が登録されている。
     * なお、ここでは、実行中プロジェクトと、完了プロジェクトの二つがインスタンス化
     * されているために、2回繰り返される
     */
    for (const listenerFn of this.listeners) {
      /**
       * projects のコピーを渡す。
       * → Listener 関数の方で、project の中身を編集したりすることが無いようにするため
       */
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

// Validation
type Validatable = {
  value: string | number;
  required?: boolean; // required: boolean | undefined と同義
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
};

function validate(validatableInput: Validatable): boolean {
  let isValid = true;

  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (
    /**
     * if (validatavleInput) としてしまうと、minLength = 0 を設定している場合、
     * falsy 判定になり、条件に反するということになる。
     *
     * そこで、minLength != null とする事で、null と undefined 以外は条件を通る
     * という書き方をするのがベター
     * （ minLength !== undefined とすると、undefined 以外という判定になる
     * 安全性を高めるといった観点では、 minLength != null の方が良い）
     *
     * また、そもそも minLength = 0 は、required のチェックとほぼ同じなので、
     * チェックする必要があるのかという議論の余地がある。。
     */
    validatableInput.minLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }

  return isValid;
}

// autobind decorator
function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      return originalMethod.bind(this);
    },
  };
  return adjDescriptor;
}

/**
 * DOM に何かを表示するための共通化クラスの作成
 */
// Component Class
abstract class Component<
  /**
   * hostElement に関して、div 以外の ul タグなどもあり得る
   * また、element もさまざまな型が入ってくることが想定される。
   * → Generics を使い柔軟に対応できるようにする
   * また、範囲として全ての HTML タグの親元である、HTMLElement
   * を指定しておく。
   */
  T extends HTMLElement,
  U extends HTMLElement
> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  /**
   * コンストラクタ関数では、基本的に要素への参照を定義するのに使う
   * それ以外は、各メソッドに分ける
   */
  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,

    // 任意の引数は常に最後に指定しておく
    newElementId?: string
  ) {
    /**
     * <template>
     * #document-fragment
     * <hostElement>
     */
    this.templateElement = document.querySelector(
      templateId
    )! as HTMLTemplateElement;

    this.hostElement = document.querySelector(hostElementId)! as T;

    // this.templateElement に属するノードをクローンする
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );

    // #document-fragment の最初のひとつ目の hostElement を取り出す
    this.element = importedNode.firstElementChild as U;

    // id が指定されていたら、id を付与しスタイルをつける
    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtBegining: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBegining ? 'afterbegin' : 'beforeend',
      this.element
    );
  }

  // 継承先のクラスで以下のメソッドを実装することを強制
  abstract configure(): void;
  abstract renderContent(): void;
}

// ProjectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  mandayInputElement: HTMLInputElement;

  constructor() {
    super('#project-input', '#app', true, 'user-input');

    // form のそれぞれの input の参照
    this.titleInputElement = this.element.querySelector(
      '#title'
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      '#description'
    ) as HTMLInputElement;
    this.mandayInputElement = this.element.querySelector(
      '#manday'
    ) as HTMLInputElement;

    this.configure();
  }

  ////  Public Methods  ////
  configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  renderContent() {}

  ////  Private Methods  ////

  private gatherUserInput(): [string, string, number] | void {
    // 各フォームの値
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredManday = this.mandayInputElement.value;

    // 各フォームの値とチェックの設定を合わせたオブジェクト
    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 10,
    };
    const MandayValidatable: Validatable = {
      value: +enteredManday,
      required: true,
      min: 1,
      max: 100,
    };

    // バリデーション
    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(MandayValidatable)
    ) {
      alert('入力値が正しくありません。再度入力してください。');
      return;
    } else {
      return [
        enteredTitle,
        enteredDescription,
        parseFloat(enteredManday) /* もしくは、+enteredManday */,
      ];
    }
  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';

    /**
     * number の型であっても、value には、string 型として入っているので、
     * から文字を設定してあげることで空欄に
     */
    this.mandayInputElement.value = '';
  }

  @Autobind
  private submitHandler(e: Event) {
    // HTTP request が送られないようにする。
    e.preventDefault();

    const userInput = this.gatherUserInput();

    if (Array.isArray(userInput)) {
      // 各要素を、各変数に挿入
      const [title, description, manday] = userInput;

      // グローバルステートメントに挿入
      projectState.addProject(title, description, manday);

      // submit 後の各フォームを空欄にする
      this.clearInputs();
    }
  }
}

// ProjectList Class
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  // project の配列を保存するためのプロパティ
  assignedProjects: Project[] = [];

  constructor(
    /**
     * enum で projectStatus の状態を定義したが、ここのコンストラクタ関数内で、
     * id にステータスの文字列が使われているために、あえて文字列で書いておく
     */
    private type:
      | 'active'
      | 'finished' /* 実行中のプロジェクトと終了したプロジェクト */
  ) {
    super(
      '#project-list',
      '#app',
      false,

      /**
       * `${this.type}-projects` の this は削除する
       * → super が完了するまで、this は呼び出せない
       */
      `${type}-projects`
    );

    // this.assignedProjects = [];

    // Listener イベントを登録する
    this.configure();

    // section タグの中の要素に id や タイトルを設定していく
    this.renderContent();
  }

  ////  Public Methods  ////

  /**
   * アロー関数を使用した場合、呼出時ではなく関数宣言時に this を束縛する
   * → 2回目以降、すなわち ProjectInput クラスで submit されて、
   * ProjectStatement クラスの addProject メソッドで呼び出される際も、
   * この this は、ProjectList クラスのインスタンスオブジェクトで束縛される
   */
  configure() {
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        // active でインスタンス化されているオブジェクトの場合
        if (this.type === 'active') {
          // prjの中で、active だけのものを返す
          return prj.status === ProjectStatus.Active;
        }
        // finished でインスタンス化されているオブジェクトの場合
        // prjの中で、finished だけのものを返す
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  /**
   * project のリストを表示するための関数
   *
   * private にしておきたいが、abstract で宣言されているメソッドは、
   * public しか受け付けない
   */
  renderContent() {
    const listId = `${this.type}-projects-list`;
    (this.element.querySelector('ul')! as HTMLUListElement).id = listId;
    this.element.querySelector('h2')!.textContent =
      this.type === 'active' ? '実行中プロジェクト' : '完了プロジェクト';
  }

  ////  Private Methods  ////
  private renderProjects() {
    const listEl = document.querySelector(
      `#${this.type}-projects-list`
    )! as HTMLUListElement;

    /**
     * for 文でプロジェクトの一覧を毎回描写しているために、
     * 既に描画されているプロジェクトを一旦削除する。
     */
    listEl.innerHTML = '';

    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = prjItem.title;
      listEl.appendChild(listItem);
    }
  }
}

const prjInput = new ProjectInput();

const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
