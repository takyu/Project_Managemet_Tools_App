/// <reference path="base-component.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../state/project-state.ts" />
/// <reference path="../models/project.ts" />
/// <reference path="../models/drag-drop.ts" />

namespace Components {
  // ProjectList Class
  export class ProjectList
    extends BaseComponent<HTMLDivElement, HTMLElement>
    implements DDInterfaces.DragTarget
  {
    // project の配列を保存するためのプロパティ
    assignedProjects: ProjectModel.Project[] = [];

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

      /**
       * 1. drag イベントを監視する
       * 2. Listener イベントを登録する
       */
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
      this.element.addEventListener('dragover', this.dragOverHandler);
      this.element.addEventListener('drop', this.dropHandler);
      this.element.addEventListener('dragleave', this.dragLeaveHandler);

      State.projectState.addListener((projects: ProjectModel.Project[]) => {
        const relevantProjects = projects.filter((prj) => {
          // active でインスタンス化されているオブジェクトの場合
          if (this.type === 'active') {
            // prjの中で、active だけのものを返す
            return prj.status === ProjectModel.ProjectStatus.Active;
          }
          // finished でインスタンス化されているオブジェクトの場合
          // prjの中で、finished だけのものを返す
          return prj.status === ProjectModel.ProjectStatus.Finished;
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

    /**
     * js で drag & drop を実装するための必須の項目
     *
     * drag & drop をしているときに、その場所が有効な drop 対象かどうかを
     * ブラウザに伝えるためのイベントハンドラー
     */
    @Decorators.Autobind
    dragOverHandler(event: DragEvent): void {
      if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
        /**
         * デフォルトの drag & drop は、js では許可されない
         * → ゆえに、ProjectList のセクション の上に drop したい時は、
         * 許可されないのを妨げる → dropを許可するといった事をする。
         *
         * これをしない場合は、drop ハンドラーが呼び出されない
         */
        event.preventDefault();

        // ul タグにスタイルのクラスを追加
        const listEl = this.element.querySelector('ul')! as HTMLUListElement;
        listEl.classList.add('droppable');
      }
    }

    /**
     * 実際に drop された時のイベントを扱うハンドラー
     *
     * dragOverHandler が drop を許可すると、最終的にこのイベントハンドラーが呼ばれる
     * ここで、データの更新や画面の更新が行われる
     */
    @Decorators.Autobind
    dropHandler(event: DragEvent): void {
      // drag した時に、dragStartHandler によって持ち出されているデータ（ここでは、id）を取得
      const prjId = event.dataTransfer!.getData('text/plain');

      // dropされたときに、project のデータを変更し、再描画（moveProject）
      State.projectState.moveProject(
        prjId,

        // drop 先のタイプを参照 (this.type)
        this.type === 'active'
          ? ProjectModel.ProjectStatus.Active
          : ProjectModel.ProjectStatus.Finished
      );
    }

    /**
     * ビジュアル上のフィードバックを扱うイベントハンドラー
     *
     * drag & drop 終了後にビジュアル上の変更を適用することができる
     */
    @Decorators.Autobind
    dragLeaveHandler(_: DragEvent): void {
      const listEl = this.element.querySelector('ul')! as HTMLUListElement;
      listEl.classList.remove('droppable');
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
        new ProjectItem(`#${listEl.id}`, prjItem);
      }
    }
  }
}
