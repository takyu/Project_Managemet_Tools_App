// autobind decorator
function Autobind(
  _: any,
  _2: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      return originalMethod.bind(this);
    },
  };
  return adjDescriptor;
}

// ProjectInput Class
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  mandayInputElement: HTMLInputElement;

  /**
   * コンストラクタ関数では、基本的に要素への参照を定義するのに使う
   * それ以外は、各メソッドに分ける
   */
  constructor() {
    /**
     * <template>
     * #document-fragment
     * <form>
     */
    this.templateElement = document.querySelector(
      '#project-input'
    )! as HTMLTemplateElement;

    this.hostElement = document.querySelector('#app')! as HTMLDivElement;

    // this.templateElement に属するノードをクローンする
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );

    // #document-fragment の最初のひとつ目の form を取り出す
    this.element = importedNode.firstElementChild as HTMLFormElement;

    // id を付与しスタイルをつける
    this.element.id = 'user-input';

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
    this.attach();
  }

  @Autobind
  private submitHandler(e: Event) {
    // HTTP request が送られないようにする。
    e.preventDefault();

    console.log(this.titleInputElement.value);
  }

  private configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

const prjInput = new ProjectInput();
