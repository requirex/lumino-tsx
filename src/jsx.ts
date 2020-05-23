import { Widget, DockPanel } from '@lumino/widgets';
import { assign } from 'requirex';

export type Style = Partial<CSSStyleDeclaration>;

type JSXElement<Type = HTMLElement> = Partial<Type> | {
	ref?: (ref: JSXElement<Type>) => void,
	style?: Style;
}

declare module '@lumino/widgets/lib/widget' {
	export interface Widget {
		tsxChildren?: (children: any[]) => void;
		flex?: number;
	}
}

export namespace jsx {
	export namespace JSX {
		export type Element = HTMLElement | Text | Widget;

		export type IntrinsicElements = {
			[name in keyof HTMLElementTagNameMap]?: JSXElement<HTMLElementTagNameMap[name]>;
		};
	}
}

export type WrapTSX<Type extends new () => any> = (
	Type extends new (options: infer Options) => infer Instance ? Type & {
		new(
			options: Options & {
				className?: string;
				flex?: number,
				id?: string,
				title?: string
			},
			children?: any[]
		): Instance
	} : never
);

export function wrapTSX<Type extends new () => any>(constructor: Type) {
	return constructor as unknown as WrapTSX<Type>;
}

Widget.prototype.tsxChildren = function(this: any, children: any[]) {
	if(this.addWidget) {
		for(let child of children) {
			if(child instanceof Widget) {
				this.addWidget(child);
			}
		}
	}
};

DockPanel.prototype.tsxChildren = function(this: DockPanel, children: any[]) {
	const config = children[0].config;

	if(config) {
		this.restoreLayout({ main: config });
	}
}

export function jsx(
	kind: string | {
		new(attrs: { [key: string]: any }): any,
		tsxChildren?: (children: any[]) => void
	},
	attrs: { [key: string]: any },
	...children: jsx.JSX.Element[]
): jsx.JSX.Element {
	if(typeof kind == 'string') {
		// Handle HTML element.
		const doc = document;
		const element = doc.createElement(kind);

		for(let child of children) {
			if(typeof (child) != 'object') {
				child = doc.createTextNode(child);
			}

			if(child instanceof Widget) {
				Widget.attach(child, element);
			} else {
				element.appendChild(child);
			}
		}

		if(attrs) {
			let ref = attrs.ref;
			if(ref) delete attrs.ref;

			assign(element, attrs, 1)

			if(ref) ref(element);
		}

		return element;
	} else {
		// Handle Lumino widget.
		const child = children && children[0];

		if(child && !(child instanceof Widget)) {
			(attrs || (attrs = {})).node = child;
		}

		const widget: Widget = new kind(attrs || void 0);

		if(attrs) {
			if(attrs.className) {
				for(let name of attrs.className.split(/\s+/)) {
					if(name) widget.addClass(name);
				}
			}
			if(attrs.flex) widget.flex = attrs.flex;
			if(attrs.id) widget.id = attrs.id;
			if(attrs.title) widget.title.label = attrs.title;
		}

		if(child && widget.tsxChildren) widget.tsxChildren(children);

		return widget;
	}
}
