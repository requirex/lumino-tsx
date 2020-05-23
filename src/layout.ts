import { DockLayout } from '@lumino/widgets';

export class RowCol {

	constructor(attrs: { flex?: number }) { }

	tsxChildren(children?: any[]) {
		const sizes: number[] = [];

		children = (children || []).map((child, num) => {
			let flex = child.flex;
			if(!flex && flex !== 0) flex = 1;

			sizes[num] = flex;

			return child.config || {
				type: 'tab-area',
				widgets: [child],
				currentIndex: 0
			};
		})

		this.config = {
			type: 'split-area',
			orientation: this.dir!,
			children,
			sizes
		};
	}

	public config?: DockLayout.ISplitAreaConfig;
	public flex?: number;
	public dir?: 'horizontal' | 'vertical';

}

export class Row extends RowCol { }

Row.prototype.dir = 'horizontal';

export class Col extends RowCol { }

Col.prototype.dir = 'vertical';
