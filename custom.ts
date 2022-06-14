namespace SpriteKind {
    //% isKind
    export const MiniMenu = SpriteKind.create();
}

//% icon="\uf0c9"
//% color="#36b58b"
//% block="Mini Menu"
namespace miniMenu {
    let stateStack: MiniMenuState[];
    let printCanvas: Image;

    class MiniMenuState {
        defaultStyle: Style;
        selectedStyle: Style;

        constructor() {
            this.defaultStyle = new Style();

            this.defaultStyle.iconPadding = 8;
            this.defaultStyle.padding = 2;
            this.defaultStyle.foreground = 15;
            this.defaultStyle.background = 1;

            this.selectedStyle = this.defaultStyle.clone();
            this.selectedStyle.foreground = 1;
            this.selectedStyle.background = 3;

            for (const button of [controller.up, controller.right, controller.down, controller.menu, controller.left, controller.A, controller.B]) {
                button.addEventListener(ControllerButtonEvent.Pressed, () => {
                    for (const sprite of sprites.allOfKind(SpriteKind.MiniMenu)) {
                        (sprite as MenuSprite).fireButtonEvent(button);
                    }
                })
            }
        }
    }

    export enum Alignment {
        Left,
        Center,
        Right
    }

    export enum StyleProperty {
        //% block="padding"
        Padding,
        //% block="foreground"
        Foreground,
        //% block="background"
        Background,
        //% block="border color"
        BorderColor,
        //% block="border width"
        BorderWidth,
        //% block="border radius"
        BorderRadius,
        //% block="vertical margin"
        VerticalMargin,
        //% block="horizontal margin"
        HorizontalMargin,
        //% block="icon padding"
        IconPadding,
        //% block="alignment"
        Alignment,
        //% block="icon only"
        IconOnly
    }

    export enum MenuStyleProperty {
        //% block="width"
        Width,
        //% block="height"
        Height,
        //% block="border color"
        BorderColor,
        //% block="border width"
        BorderWidth,
        //% block="scroll speed"
        ScrollSpeed,
        //% block="rows"
        Rows,
        //% block="columns"
        Columns,
        //% block="infinite scroll",
        InfiniteScroll
    }

    export enum StyleKind {
        //% block="default"
        Default,
        //% block="selected"
        Selected,
        //% block="title"
        Title,
        //% block="default and selected"
        DefaultAndSelected,
        //% block="all"
        All
    }

    export enum MoveDirection {
        //% block=up
        Up,
        //% block=down
        Down,
        //% block=left
        Left,
        //% block=right
        Right
    }

    export class Style {
        padding: number;
        foreground: number;
        background: number;
        borderColor: number;
        borderWidth: number;
        borderRadius: number;
        verticalMargin: number;
        horizontalMargin: number;
        iconPadding: number;
        iconOnly: number;
        alignment: Alignment;

        constructor() {
            this.padding = 0;
            this.foreground = 1;
            this.background = 15;
            this.borderColor = 1;
            this.borderWidth = 0;
            this.borderRadius = 0;
            this.verticalMargin = 0;
            this.horizontalMargin = 0;
            this.iconPadding = 0;
            this.iconOnly = 0;
            this.alignment = Alignment.Left
        }

        clone() {
            const res = new Style();
            res.padding = this.padding;
            res.foreground = this.foreground;
            res.background = this.background;
            res.borderColor = this.borderColor;
            res.borderWidth = this.borderWidth;
            res.borderRadius = this.borderRadius;
            res.verticalMargin = this.verticalMargin;
            res.horizontalMargin = this.horizontalMargin;
            res.iconPadding = this.iconPadding;
            res.alignment = this.alignment;
            return res;
        }

        setProperty(prop: StyleProperty, value: number) {
            switch (prop) {
                case StyleProperty.Padding:
                    this.padding = value;
                    break;
                case StyleProperty.Foreground:
                    this.foreground = value;
                    break;
                case StyleProperty.Background:
                    this.background = value;
                    break;
                case StyleProperty.BorderColor:
                    this.borderColor = value;
                    break;
                case StyleProperty.BorderWidth:
                    this.borderWidth = value;
                    break;
                case StyleProperty.BorderRadius:
                    this.borderRadius = value;
                    break;
                case StyleProperty.VerticalMargin:
                    this.verticalMargin = value;
                    break;
                case StyleProperty.HorizontalMargin:
                    this.horizontalMargin = value;
                    break;
                case StyleProperty.IconPadding:
                    this.iconPadding = value;
                    break;
                case StyleProperty.Alignment:
                    this.alignment = value;
                    break;
                case StyleProperty.IconOnly:
                    this.iconOnly = value;
                    break;
            }
        }
    }

    export class MenuItem {
        contentHeight: number;
        contentWidth: number;
        font: image.Font;

        constructor(public text: string, public icon: Image) {
            this.font = image.getFontForText(text);
            this.font.charHeight = image.getFontForText(text).charHeight;
            this.font.charWidth = image.getFontForText(text).charWidth;

            this.contentHeight = Math.max(
                this.font.charHeight,
                icon ? icon.height : 0
            )

            this.contentWidth = image.getFontForText(text).charWidth * text.length;
            if (icon) {
                this.contentWidth += icon.width;
            }
        }

        getHeight(style: Style) {
            return this.contentHeight + (style.padding << 1) + (style.verticalMargin << 1) + (style.borderWidth << 1);
        }

        getWidth(style: Style) {
            if (style.iconOnly) {
                return (this.icon ? this.icon.width : 0) + (style.padding << 1) + (style.horizontalMargin << 1) + (style.borderWidth << 1)
            }
            return this.contentWidth + (style.padding << 1) + (style.horizontalMargin << 1) + (style.borderWidth << 1) + (this.icon ? style.iconPadding : 0);
        }

        drawTo(left: number, top: number, target: Image, style: Style, width: number, height: number, cutTop: boolean, cutLeft: boolean, scrollTick: number, maxWidth = 0, maxHeight = 0) {
            if (height <= 0 || width <= 0) return;

            if (!maxWidth) {
                maxWidth = this.getWidth(style);
            }

            if (!maxHeight) {
                maxHeight = this.getHeight(style);
            }

            const widthOfText = this.font.charWidth * this.text.length;

            let borderLeft = left + style.horizontalMargin;
            let borderTop = top + style.verticalMargin;
            let borderRight = left + maxWidth - style.horizontalMargin;
            let borderBottom = top + maxHeight - style.verticalMargin;

            let contentLeft = borderLeft + style.borderWidth + style.padding;
            let contentTop = borderTop + style.borderWidth + style.padding;
            let contentRight = left + maxWidth - style.horizontalMargin - style.borderWidth - style.padding;
            let contentBottom = top + maxHeight - style.verticalMargin - style.borderWidth - style.padding;

            let textLeft: number;
            let textTop = contentTop + ((contentBottom - contentTop) >> 1) - (this.font.charHeight >> 1);
            let textRight: number;
            let textBottom = textTop + this.font.charHeight;

            let iconLeft: number;
            let iconTop: number;
            let iconRight: number;
            let iconBottom: number;

            let cutoffLeft: number;
            let cutoffTop: number;
            let cutoffRight: number;
            let cutoffBottom: number;

            if (cutLeft) {
                cutoffLeft = left + maxWidth - width;
                cutoffRight = left + maxWidth;
            }
            else {
                cutoffLeft = left;
                cutoffRight = left + width;
            }

            if (cutTop) {
                cutoffTop = top + maxHeight - height;
                cutoffBottom = top + maxHeight;
            }
            else {
                cutoffTop = top;
                cutoffBottom = top + height;
            }

            if (this.icon) {
                iconTop = contentTop + ((contentBottom - contentTop) >> 1) - (this.icon.height >> 1);
                iconBottom = iconTop + this.icon.height

                if (style.iconOnly) {
                    if (style.alignment === Alignment.Left) {
                        iconLeft = contentLeft;
                    }
                    else if (style.alignment === Alignment.Right) {
                        iconLeft = contentRight - this.icon.width;
                    }
                    else {
                        iconLeft = contentLeft + ((contentRight - contentLeft) >> 1) - (this.icon.width >> 1);
                    }
                }
                else if (style.alignment !== Alignment.Left && this.icon.width + widthOfText + style.iconPadding < contentRight - contentLeft) {
                    if (style.alignment === Alignment.Right) {
                        iconLeft = contentRight - widthOfText - style.iconPadding - this.icon.width;
                    }
                    else {
                        iconLeft = contentLeft + ((contentRight - contentLeft) >> 1) - ((this.icon.width + widthOfText + style.iconPadding) >> 1);
                    }
                }
                else {
                    iconLeft = contentLeft;
                }

                iconRight = iconLeft + this.icon.width;
                textLeft = iconRight + style.iconPadding;
            }
            else if (style.alignment !== Alignment.Left && widthOfText < (contentRight - contentLeft)) {
                if (style.alignment === Alignment.Right) {
                    textLeft = contentRight - widthOfText;
                }
                else {
                    textLeft = contentLeft + ((contentRight - contentLeft) >> 1) - (widthOfText >> 1)
                }
            }
            else {
                textLeft = contentLeft;
            }

            textRight = Math.min(textLeft + widthOfText, contentRight);

            fillRegion(
                target,
                Math.max(borderLeft, cutoffLeft),
                Math.max(borderTop, cutoffTop),
                Math.min(borderRight, cutoffRight),
                Math.min(borderBottom, cutoffBottom),
                style.borderColor
            );

            fillRegion(
                target,
                Math.max(borderLeft + style.borderWidth, cutoffLeft),
                Math.max(borderTop + style.borderWidth, cutoffTop),
                Math.min(borderRight - style.borderWidth, cutoffRight),
                Math.min(borderBottom - style.borderWidth, cutoffBottom),
                style.background
            );

            if (this.icon) {
                drawImageInRect(
                    target,
                    this.icon,
                    Math.max(iconLeft, cutoffLeft),
                    Math.max(iconTop, cutoffTop),
                    Math.min(iconRight, cutoffRight),
                    Math.min(iconBottom, cutoffBottom),
                    cutLeft,
                    cutTop
                )

                if (style.iconOnly) return;
            }

            if (scrollTick) {
                const maxScroll = widthOfText - (textRight - textLeft) + this.font.charWidth;
                const animationLength = (100 + maxScroll + 100) << 2;

                scrollTick = scrollTick % animationLength;

                printScrolledText(
                    target,
                    this.text,
                    textLeft,
                    textTop,
                    textRight,
                    textBottom,
                    style.foreground,
                    Math.min(Math.max((scrollTick - 100) >> 2, 0), maxScroll),
                    this.font
                )
            }
            else {
                const printableCharacters = Math.ceil((textRight - textLeft) / this.font.charWidth)
                printTextInRect(
                    target,
                    this.text.substr(0, printableCharacters),
                    Math.max(textLeft, cutoffLeft),
                    Math.max(textTop, cutoffTop),
                    Math.min(textRight, cutoffRight),
                    Math.min(textBottom, cutoffBottom),
                    style.foreground,
                    cutLeft,
                    cutTop,
                    this.font
                )
            }
        }
    }

    export function _state() {
        _init();
        return stateStack[stateStack.length - 1];
    }

    export function _init() {
        if (stateStack) return;

        stateStack = [
            new MiniMenuState()
        ];

        printCanvas = image.create(12, 12);

        game.addScenePushHandler(() => {
            stateStack.push(new MiniMenuState())
        })

        game.addScenePopHandler(() => {
            stateStack.pop();

            if (stateStack.length === 0) {
                stateStack.push(new MiniMenuState());
            }
        })
    }

    export class MenuSprite extends sprites.ExtendableSprite {
        items: MenuItem[];

        titleStyle: Style;
        defaultStyle: Style;
        selectedStyle: Style;

        customWidth: number;
        customHeight: number;
        selectedIndex: number;
        buttonEventsEnabled: boolean;

        yScroll: number;
        targetYScroll: number;
        xScroll: number;
        targetXScroll: number;

        scrollAnimationTick: number;
        titleAnimationTick: number;

        title: MenuItem;
        scrollSpeed: number;
        columns: number;
        rows: number;
        infiniteScroll: boolean;

        protected buttonHandlers: any;

        constructor() {
            super(img`.`, SpriteKind.MiniMenu);
            _init();
            this.titleStyle = _state().defaultStyle.clone()
            this.titleStyle.setProperty(StyleProperty.Background, 0)
            this.defaultStyle = _state().defaultStyle.clone();
            this.selectedStyle = _state().selectedStyle.clone();

            this.selectedIndex = 0;
            this.items = [];

            this.buttonHandlers = {};
            this.buttonEventsEnabled = false;

            this.onButtonEvent(controller.up, () => this.moveSelection(MoveDirection.Up));
            this.onButtonEvent(controller.down, () => this.moveSelection(MoveDirection.Down));
            this.onButtonEvent(controller.left, () => this.moveSelection(MoveDirection.Left));
            this.onButtonEvent(controller.right, () => this.moveSelection(MoveDirection.Right));
            this.yScroll = 0;
            this.targetYScroll = 0;
            this.xScroll = 0;
            this.targetXScroll = 0;
            this.scrollAnimationTick = -1;
            this.titleAnimationTick = 0;
            this.scrollSpeed = 150;
            this.columns = 0;
            this.rows = 0;
        }

        get width(): number {
            return this.getWidth();
        }

        get height(): number {
            return this.getHeight();
        }

        draw(drawLeft: number, drawTop: number) {
            if (!this.items) return;

            if (this.columns <= 1 && this.rows === 0) {
                this.drawSingleColumn(drawLeft, drawTop);
                return;
            }
            else if (this.columns === 0 && this.rows === 1) {
                this.drawSingleRow(drawLeft, drawTop);
                return;
            }

            const menuTop = drawTop;
            const menuWidth = this.getWidth();
            const menuHeight = this.getHeight();
            const widthPerColumn = (menuWidth / Math.max(this.columns, 1)) | 0;
            const heightPerRow = (menuHeight / Math.max(this.rows, 1)) | 0;

            let index = 0;
            let current: MenuItem;
            let style: Style;
            let isSelected: boolean;

            let xOffset = -(this.xScroll | 0);
            let yOffset = -(this.yScroll | 0);

            const totalRows = Math.ceil(this.items.length / this.columns)

            for (let row = 0; row < totalRows; row++) {
                for (let col = 0; col < this.columns; col ++) {
                    isSelected = index === this.selectedIndex;
                    style = isSelected ? this.selectedStyle : this.defaultStyle;
                    current = this.items[index];

                    if (!current) return;

                    if (isSelected) {
                        if (yOffset < 0) this.targetYScroll = (yOffset + (this.yScroll | 0));
                        else if (yOffset > menuHeight - heightPerRow) this.targetYScroll = yOffset + (this.yScroll | 0) + heightPerRow - menuHeight;
                        else this.targetYScroll = this.yScroll

                        if (xOffset < 0) this.targetXScroll = (xOffset + (this.xScroll | 0));
                        else if (xOffset > menuWidth - widthPerColumn) this.targetXScroll = xOffset + (this.xScroll | 0) + menuWidth - widthPerColumn;
                        else this.targetXScroll = this.xScroll
                    }

                    if (yOffset < 0) {
                        current.drawTo(
                            drawLeft + xOffset,
                            menuTop + yOffset,
                            screen,
                            style,
                            widthPerColumn,
                            heightPerRow + yOffset,
                            true,
                            false,
                            isSelected ? this.scrollAnimationTick : 0,
                            widthPerColumn,
                            heightPerRow
                        )
                    }
                    else {
                        current.drawTo(
                            drawLeft + xOffset,
                            menuTop + yOffset,
                            screen,
                            style,
                            widthPerColumn,
                            Math.min(heightPerRow, menuHeight - yOffset),
                            false,
                            false,
                            isSelected ? this.scrollAnimationTick : 0,
                            widthPerColumn,
                            heightPerRow
                        )
                    }

                    xOffset += widthPerColumn;
                    index ++;
                }
                xOffset = -this.xScroll
                yOffset += heightPerRow;
            }
        }

        update(deltaTimeMillis: number) {
            if (Math.abs(this.yScroll - this.targetYScroll) <= 1) {
                this.yScroll = this.targetYScroll
            }
            else {
                this.yScroll += (this.targetYScroll - this.yScroll) / 10;
            }
                        
            if (Math.abs(this.xScroll - this.targetXScroll) <= 1) {
                this.xScroll = this.targetXScroll
            }
            else {
                this.xScroll += (this.targetXScroll - this.xScroll) / 10;
            }

            const deltaTick = (deltaTimeMillis / 1000) * this.scrollSpeed;

            if (this.yScroll === this.targetYScroll && this.xScroll === this.targetXScroll) {
                this.scrollAnimationTick += deltaTick
            }
            else {
                this.scrollAnimationTick = 0
            }

            this.titleAnimationTick += deltaTick

            if (this.scrollAnimationTick < 0) this.scrollAnimationTick = 0
            if (this.titleAnimationTick < 0) this.titleAnimationTick = 0

        }

        setMenuItems(items: MenuItem[]) {
            this.items = items;
        }

        //% blockId=mini_menu_sprite_set_button_events_enabled
        //% block="$this set button events enabled $enabled"
        //% this.defl=myMenu
        //% enable.shadow=toggleOnOff
        setButtonEventsEnabled(enabled: boolean) {
            this.buttonEventsEnabled = enabled;
        }

        //% blockId=mini_menu_sprite_move_selection_up
        //% block="$this move selection $direction"
        //% this.defl=myMenu
        //% direction.shadow=mini_menu_move_direction
        moveSelection(direction: number) {
            if (this.items.length === 0) return;

            if (this.columns <= 1 && this.rows === 0) {
                if (direction === MoveDirection.Up) {
                    this.selectedIndex = (this.selectedIndex + this.items.length - 1) % this.items.length;
                }
                else if (direction === MoveDirection.Down) {
                    this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
                }
                else {
                    return
                }
                this.scrollAnimationTick = 0;
            }
            else if (this.columns === 0 && this.rows === 1) {
                if (direction === MoveDirection.Left) {
                    this.selectedIndex = (this.selectedIndex + this.items.length - 1) % this.items.length;
                }
                else if (direction === MoveDirection.Right) {
                    this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
                }
                else {
                    return;
                }
                this.scrollAnimationTick = 0;
            }
            else {
                let column = this.selectedIndex % this.columns;
                let row = Math.idiv(this.selectedIndex, this.columns);

                const maxRows = Math.ceil(this.items.length / this.columns);

                if (direction === MoveDirection.Up) {
                    row = (row + maxRows - 1) % maxRows;
                    
                    if (column + row * this.columns >= this.items.length) {
                        row = maxRows - 2;
                    }
                }
                else if (direction === MoveDirection.Down) {
                    row = (row + 1) % maxRows;
                    if (column + row * this.columns >= this.items.length) {
                        row = 0
                    }
                }
                else if (direction === MoveDirection.Left) {
                    column = (column + this.columns - 1) % this.columns
                    if (column + row * this.columns >= this.items.length) {
                        column = (this.items.length - 1) % this.columns
                    }
                }
                else if (direction === MoveDirection.Right) {
                    column = (column + 1) % this.columns
                    if (column + row * this.columns >= this.items.length) {
                        column = 0;
                    }
                }

                this.selectedIndex = column + row * this.columns
                this.scrollAnimationTick = 0
            }
        }

        //% blockId=mini_menu_sprite_close_menu
        //% block="close $this"
        //% this.defl=myMenu
        close() {
            this.destroy();
        }

        fireButtonEvent(button: controller.Button) {
            if (!this.buttonEventsEnabled) return;

            const handler = this.buttonHandlers[button.id];

            if (handler && this.items.length) {
                handler(this.items[this.selectedIndex].text);
            }
        }

        onButtonEvent(button: controller.Button, handler: (text: string) => void) {
            this.buttonHandlers[button.id] = handler;
        }

        setProperty(style: MenuStyleProperty, value: number) {
            switch (style) {
                case MenuStyleProperty.Width:
                    this.customWidth = value;
                    break;
                case MenuStyleProperty.Height:
                    this.customHeight = value;
                    break;
                case MenuStyleProperty.ScrollSpeed:
                    this.scrollSpeed = value;
                    break;
                case MenuStyleProperty.Columns:
                    this.columns = Math.max(value | 0, 0);
                    break;
                case MenuStyleProperty.Rows:
                    this.rows = Math.max(value | 0, 0);
                    break;
                case MenuStyleProperty.InfiniteScroll:
                    this.infiniteScroll = !!value;
                    break;
            }
        }

        protected drawSingleColumn(drawLeft: number, drawTop: number) {
            if (!this.items) return;

            const width = this.getWidth();

            let current: MenuItem;
            let currentHeight = 0;
            let style: Style;
            let isSelected: boolean;

            const height = this.getHeight();

            if (this.title) {
                currentHeight = this.title.getHeight(this.titleStyle);
                this.title.drawTo(
                    drawLeft,
                    drawTop,
                    screen,
                    this.titleStyle,
                    width,
                    currentHeight,
                    true,
                    false,
                    this.titleAnimationTick,
                    this.width
                )
            }

            let offset = -(this.yScroll | 0);
            const menuTop = drawTop + currentHeight;
            const menuHeight = height - currentHeight;

            for (let i = 0; i < this.items.length; i++) {
                current = this.items[i];
                isSelected = this.selectedIndex === i
                style = isSelected ? this.selectedStyle : this.defaultStyle;
                currentHeight = current.getHeight(style);

                if (isSelected) {
                    if (offset < 0) this.targetYScroll = (offset + (this.yScroll | 0));
                    else if (offset > menuHeight - currentHeight) this.targetYScroll = offset + (this.yScroll | 0) + currentHeight - menuHeight;
                    else this.targetYScroll = this.yScroll

                    if (this.targetYScroll !== this.yScroll) {
                        this.scrollAnimationTick = 0;
                    }
                }


                if (offset < -currentHeight) {
                    offset += currentHeight;
                    continue;
                }

                if (offset < 0) {
                    current.drawTo(
                        drawLeft,
                        menuTop + offset,
                        screen,
                        style,
                        width,
                        currentHeight + offset,
                        true,
                        false,
                        isSelected ? this.scrollAnimationTick : 0,
                        this.width
                    )
                }
                else {
                    current.drawTo(
                        drawLeft,
                        menuTop + offset,
                        screen,
                        style,
                        width,
                        Math.min(currentHeight, menuHeight - offset),
                        false,
                        false,
                        isSelected ? this.scrollAnimationTick : 0,
                        this.width
                    )
                }

                offset += currentHeight;
            }
        }

        protected drawSingleRow(drawLeft: number, drawTop: number) {
            if (!this.items) return;

            const width = this.getWidth();

            let current: MenuItem;
            let currentWidth = 0;
            let style: Style;
            let isSelected: boolean;

            const height = this.getHeight();
            let menuTop = drawTop;
            let menuHeight = height;

            if (this.title) {
                const titleHeight = this.title.getHeight(this.titleStyle);
                menuHeight -= titleHeight;
                menuTop += titleHeight;

                this.title.drawTo(
                    drawLeft,
                    drawTop,
                    screen,
                    this.titleStyle,
                    width,
                    titleHeight,
                    false,
                    false,
                    this.titleAnimationTick
                )
            }

            let offset = -(this.xScroll | 0);

            for (let i = 0; i < this.items.length; i++) {
                current = this.items[i];
                isSelected = this.selectedIndex === i
                style = isSelected ? this.selectedStyle : this.defaultStyle;
                currentWidth = Math.min(current.getWidth(style), width);

                if (isSelected) {
                    if (offset < 0) this.targetXScroll = (offset + (this.xScroll | 0));
                    else if (offset > width - currentWidth) this.targetXScroll = offset + (this.xScroll | 0) + currentWidth - width;
                    else this.targetXScroll = this.xScroll

                    if (this.targetXScroll !== this.xScroll) {
                        this.scrollAnimationTick = 0;
                    }
                }

                if (offset < -currentWidth || offset >= width) {
                    offset += currentWidth;
                    continue;
                }

                if (offset < 0) {
                    current.drawTo(
                        drawLeft + offset,
                        menuTop,
                        screen,
                        style,
                        currentWidth + offset,
                        menuHeight,
                        false,
                        true,
                        isSelected ? this.scrollAnimationTick : 0,
                        this.width,
                        height
                    )
                }
                else {
                    current.drawTo(
                        drawLeft + offset,
                        menuTop,
                        screen,
                        style,
                        Math.min(currentWidth, width - offset),
                        menuHeight,
                        false,
                        false,
                        isSelected ? this.scrollAnimationTick : 0,
                        this.width,
                        height
                    )
                }

                offset += currentWidth;
            }
        }

        protected getWidth() {
            if (this.customWidth !== undefined) return this.customWidth;

            let max = 0;

            let current: MenuItem;
            let style: Style;

            for (let i = 0; i < this.items.length; i++) {
                current = this.items[i];
                style = this.selectedIndex === i ? this.selectedStyle : this.defaultStyle;
                max = Math.max(current.getWidth(style), max);
            }

            return max;
        }

        protected getHeight() {
            if (this.customHeight !== undefined) return this.customHeight;

            let sum = 0;

            let current: MenuItem;
            let style: Style;

            for (let i = 0; i < this.items.length; i++) {
                current = this.items[i];
                style = this.selectedIndex === i ? this.selectedStyle : this.defaultStyle;
                sum += current.getHeight(style)
            }

            return sum;
        }
    }

    function fillVerticalRegion(target: Image, left: number, top: number, width: number, bottom: number, color: number) {
        if (!color) return;
        target.fillRect(left, top, width, bottom - top, color);
    }

    function fillRegion(target: Image, left: number, top: number, right: number, bottom: number, color: number) {
        if (!color) return;
        target.fillRect(left, top, right - left, bottom - top, color);
    }

    export function drawImageInRect(target: Image, src: Image, left: number, top: number, right: number, bottom: number, cutLeft: boolean, cutTop: boolean) {
        const width = Math.min(right - left, src.width);
        const height = Math.min(bottom - top, src.height);

        if (width <= 0 || height <= 0) return;

        if (printCanvas.width < src.width || printCanvas.height < src.height) {
            printCanvas = image.create(Math.max(printCanvas.width, src.width), Math.max(printCanvas.height, src.height));
        }
        else {
            printCanvas.fill(0);
        }

        if (cutLeft) {
            if (cutTop) {
                printCanvas.drawTransparentImage(
                    src,
                    width - src.width,
                    height - src.height, 
                );
                target.drawTransparentImage(
                    printCanvas,
                    left,
                    top
                );
            }
            else {
                printCanvas.drawTransparentImage(
                    src,
                    width - src.width,
                    printCanvas.height - height,
                );
                target.drawTransparentImage(
                    printCanvas,
                    left,
                    top + height - printCanvas.height
                );
            }
        }
        else {
            if (cutTop) {
                printCanvas.drawTransparentImage(
                    src,
                    printCanvas.width - width,
                    height - src.height,
                );
                target.drawTransparentImage(
                    printCanvas,
                    left + width - printCanvas.width,
                    top
                );
            }
            else {
                printCanvas.drawTransparentImage(
                    src,
                    printCanvas.width - width,
                    printCanvas.height - height,
                );
                target.drawTransparentImage(
                    printCanvas,
                    left + width - printCanvas.width,
                    top + height - printCanvas.height
                );
            }
        }
    }

    export function printTextInRect(target: Image, text: string, left: number, top: number, right: number, bottom: number, color: number, cutLeft: boolean, cutTop: boolean, font: image.Font) {
        const width = right - left;
        const height = bottom - top;

        const textWidth = text.length * font.charWidth;

        if (textWidth <= width && font.charHeight <= height) {
            target.print(text, left, top, color, font);
            return;
        }

        const printableCharacters = Math.idiv(width, font.charWidth)

        // Optimize to print as many of the characters in one go as possible
        if (font.charHeight <= height) {
            const offset = width - printableCharacters * font.charWidth;

            printCanvas.fill(0)
            if (cutLeft) {
                target.print(text.substr(text.length - printableCharacters), right - printableCharacters * font.charWidth, top, color, font);
                printCanvas.print(text.charAt(text.length - printableCharacters - 1), -(font.charWidth - offset), 0, color, font);
                target.drawTransparentImage(printCanvas, left, top);
            }
            else {
                target.print(text.substr(0, printableCharacters), left, top, color, font)
                printCanvas.print(text.charAt(printableCharacters), printCanvas.width - offset, 0, color, font);
                target.drawTransparentImage(printCanvas, left + width - printCanvas.width, top);
            }

            return;
        }

        const offset = width - printableCharacters * font.charWidth;

        printCanvas.fill(0)
        const canvasCharacters = Math.idiv(printCanvas.width, font.charWidth);

        if (cutLeft) {
            if (cutTop) {
                for (let i = 0; i < printableCharacters; i += canvasCharacters) {
                    printCanvas.fill(0);
                    printCanvas.print(
                        text.substr(text.length - printableCharacters + i, Math.min(canvasCharacters, printableCharacters - i)),
                        0,
                        height - font.charHeight,
                        color,
                        font
                    );
                    target.drawTransparentImage(printCanvas, left + i * font.charWidth + offset, top);
                }

                if (text.length > printableCharacters) {
                    printCanvas.fill(0);
                    printCanvas.print(
                        text.charAt(text.length - printableCharacters - 1),
                        -(font.charWidth - offset),
                        height - font.charHeight,
                        color,
                        font
                    );
                    target.drawTransparentImage(printCanvas, left, top)
                }
            }
            else {
                for (let i = 0; i < printableCharacters; i += canvasCharacters) {
                    printCanvas.fill(0);
                    printCanvas.print(
                        text.substr(text.length - printableCharacters + i, Math.min(canvasCharacters, printableCharacters - i)),
                        0,
                        printCanvas.height - height,
                        color,
                        font
                    );
                    target.drawTransparentImage(printCanvas, left + i * font.charWidth + offset, top - printCanvas.height + height);
                }

                if (text.length > printableCharacters) {
                    printCanvas.fill(0);
                    printCanvas.print(
                        text.charAt(text.length - printableCharacters - 1),
                        -(font.charWidth - offset),
                        printCanvas.height - height,
                        color,
                        font
                    );
                    target.drawTransparentImage(printCanvas, left, top - printCanvas.height + height)
                }
            }
        }
        else {
            if (cutTop) {
                for (let i = 0; i < printableCharacters; i += canvasCharacters) {
                    printCanvas.fill(0);
                    printCanvas.print(
                        text.substr(i, Math.min(canvasCharacters, printableCharacters - i)),
                        0,
                        height - font.charHeight,
                        color,
                        font
                    );
                    target.drawTransparentImage(printCanvas, left + i * font.charWidth, top);
                }

                if (text.length > printableCharacters) {
                    printCanvas.fill(0);
                    printCanvas.print(
                        text.charAt(printableCharacters),
                        printCanvas.width - offset,
                        height - font.charHeight,
                        color,
                        font
                    );
                    target.drawTransparentImage(printCanvas, left + width - printCanvas.width, top)
                }
            }
            else {
                for (let i = 0; i < printableCharacters; i += canvasCharacters) {
                    printCanvas.fill(0);
                    printCanvas.print(
                        text.substr(i, Math.min(canvasCharacters, printableCharacters - i)),
                        0,
                        printCanvas.height - height,
                        color,
                        font
                    );
                    target.drawTransparentImage(printCanvas, left + i * font.charWidth, top - printCanvas.height + height);
                }

                if (text.length > printableCharacters) {
                    printCanvas.fill(0);
                    printCanvas.print(
                        text.charAt(printableCharacters),
                        printCanvas.width - offset,
                        printCanvas.height - height,
                        color,
                        font
                    );
                    target.drawTransparentImage(printCanvas, left + width - printCanvas.width, top - printCanvas.height + height)
                }
            }
        }
    }

    export function printScrolledText(target: Image, text: string, left: number, top: number, right: number, bottom: number, color: number, scroll: number, font: image.Font) {
        const startCharacter = Math.idiv(scroll, font.charWidth);
        const visibleCharacters = Math.ceil((right - left) / font.charWidth);

        if (visibleCharacters <= 1) return;
        
        printCanvas.fill(0);
        printCanvas.print(
            text.charAt(startCharacter),
            -(scroll % font.charWidth),
            0,
            color,
            font
        );
        target.drawTransparentImage(printCanvas, left, top);

        target.print(
            text.substr(startCharacter + 1, visibleCharacters - 2),
            left + font.charWidth - (scroll % font.charWidth),
            top,
            color,
            font
        );

        const charLeft = left - scroll + (startCharacter + visibleCharacters - 1) * font.charWidth;

        console.log(`${charLeft} ${right}`)

        printCanvas.fill(0);
        printCanvas.print(
            text.charAt(startCharacter + visibleCharacters - 1),
            printCanvas.width - (right - charLeft),
            0,
            color,
            font
        );
        target.drawTransparentImage(
            printCanvas,
            right - printCanvas.width,
            top
        )
    }
}
