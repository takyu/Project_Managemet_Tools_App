import { Project, ProjectStatus } from '../models/project';

// Listener の型宣言
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
export class ProjectState extends State<Project> {
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
      (this.projects.length + 1).toString(),
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
    this.updateListeners();
  }

  /**
   * 実際に移動された時は、該当 id のプロジェクトのステータスを変更
   */
  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((prj) => prj.id === projectId);

    if (
      project &&
      project.status !== newStatus /* statusが変わっている時だけ実行 */
    ) {
      project.status = newStatus;

      /**
       * project の要素が変更されたので、再度 Listener を呼び出して、
       * 画面を再描画させる
       */
      this.updateListeners();
    }
  }

  private updateListeners() {
    for (const listenerFn of this.listeners) {
      /**
       * projects のコピーを渡す。
       * → Listener 関数の方で、project の中身を編集したりすることが無いようにするため
       */
      listenerFn(this.projects.slice());
    }
  }
}

export const projectState = ProjectState.getInstance();

/**
 * このファイルは複数回呼ばれているが、何回呼ばれても
 * 読み込まれるのは一度のみである。
 */
console.log('executing...');
