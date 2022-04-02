import { BaseComponent } from '../components/base-component.js';
import { Project } from '../models/project.js';
import { Autobind } from '../decorators/autobind.js';
import { Draggable } from '../models/drag-drop.js';

/**
 * ProjectItem Class
 *
 * ひとつ一つのプロジェクトを、リスト化して表示させるようにするクラス
 */
export class ProjectItem
  extends BaseComponent<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  /* namespace_name.object( or interface ) */
  private project: Project;

  /**
   * getter
   *
   * 関数やメソッド名の上に書くのが一般的
   */
  get manday() {
    if (this.project.manday < 20) {
      return this.project.manday.toString() + '人日';
    } else {
      return (
        Math.floor(this.project.manday / 20).toString() +
        '人月' +
        ' + ' +
        (this.project.manday % 20).toString() +
        '人日'
      );
    }
  }

  constructor(hostId: string, project: Project) {
    super('#single-project', hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  configure(): void {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }

  renderContent(): void {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.manday;
    this.element.querySelector('p')!.textContent = this.project.description;
  }

  // drag 開始時に発火する
  @Autobind
  dragStartHandler(event: DragEvent): void {
    // drag イベントでデータを転送するためのプロパティ
    event.dataTransfer!.setData('text/plain', this.project.id);

    // 対象から対象へ移動させる事をブラウザ側に伝えている
    event.dataTransfer!.effectAllowed = 'move';
  }

  // drag 終了時に発火する
  dragEndHandler(_: DragEvent): void {
    console.log('finished drag');
  }
}
