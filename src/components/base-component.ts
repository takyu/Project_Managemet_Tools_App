namespace Components {
  /**
   * DOM に何かを表示するための共通化クラスの作成
   */
  // Component Class
  export abstract class BaseComponent<
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
}
