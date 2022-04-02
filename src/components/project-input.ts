// export default されたものは、そのまま別名をつける
import Cmp from './base-component';

// 別名をつけて一つのオブジェクトとしてインポート
import * as Validation from '../utils/validation';

// オブジェクトの中でも、このファイルで使いたい別名を定義できる
import { Autobind as AutoBind } from '../decorators/autobind';

import { projectState } from '../state/project-state';
// ProjectInput Class
export class ProjectInput extends Cmp<HTMLDivElement, HTMLFormElement> {
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
    const titleValidatable: Validation.Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidatable: Validation.Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 10,
    };
    const MandayValidatable: Validation.Validatable = {
      value: +enteredManday,
      required: true,
      min: 1,
      max: 100,
    };

    // バリデーション
    if (
      !Validation.validate(titleValidatable) ||
      !Validation.validate(descriptionValidatable) ||
      !Validation.validate(MandayValidatable)
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

  @AutoBind
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
