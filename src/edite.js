import { Editor } from 'slate-react'
import { Value } from 'slate'
import AutoReplace from 'slate-auto-replace'

import React from 'react'
import initialValueAsJson from './value.json'
// import { plugin } from 'postcss';
// import { edit } from 'external-editor';

const plugins = [
    AutoReplace({
        trigger: 'space',
        before: /(\*\*)(.+)(\*\*)/,

        change: (edite, e, matches) => {
            console.log(edite, e, matches.before)
            return edite
                .addMark({
                    type: 'bold'
                })
                .insertText(matches.before[2])
                .toggleMark('bold')
                .splitInline()
                // .insertText('123')
            // return

        }
    })
]
/**
 * Deserialize the initial editor value.
 *
 * @type {Object}
 */

const initialValue = Value.fromJSON(initialValueAsJson)
// console.log(initialValue)

/**
 * The auto-markdown example.
 *
 * @type {Component}
 */

class MarkdownShortcuts extends React.Component {
    /**
     * Get the block type for a series of auto-markdown shortcut `chars`.
     *
     * @param {String} chars
     * @return {String} block
     */

    getType = chars => {
        console.log(chars)
        switch (chars) {
            case '*':
            case '-':
            case '+':
                return 'list-item'
            case '>':
                return 'block-quote'
            case '---':
                return 'divider-line'
            case '#':
                return 'heading-one'
            case '##':
                return 'heading-two'
            case '###':
                return 'heading-three'
            case '####':
                return 'heading-four'
            case '#####':
                return 'heading-five'
            case '######':
                return 'heading-six'
            default:
                return null
        }
    }
    getInline = key => {
        switch (key) {
            case '**()**':
                return 'bold'
            default:
                break;
        }
    }

    /**
     *
     * Render the example.
     *
     * @return {Component} component
     */

    render () {
        return (
            <Editor
                placeholder="Write some markdown..."
                defaultValue={ initialValue }
                onKeyDown={ this.onKeyDown }
                renderNode={ this.renderNode }
                plugins={ plugins }
                renderMark={ this.renderMark }
            />
        )
    }

    /**
     * Render a Slate node.
     *
     * @param {Object} props
     * @param {Editor} editor
     * @param {Function} next
     * @return {Element}
     */

    renderNode = (props, editor, next) => {
        const { attributes, children, node } = props
        // console.log(attributes, 'attr')

        switch (node.type) {
            case 'block-quote':
                return <blockquote { ...attributes }>{ children }</blockquote>
            case 'bulleted-list':
                return <ul { ...attributes }>{ children }</ul>
            case 'heading-one':
                return <h1 { ...attributes }>{ children }</h1>
            case 'heading-two':
                return <h2 { ...attributes }>{ children }</h2>
            case 'heading-three':
                return <h3 { ...attributes }>{ children }</h3>
            case 'heading-four':
                return <h4 { ...attributes }>{ children }</h4>
            case 'heading-five':
                return <h5 { ...attributes }>{ children }</h5>
            case 'heading-six':
                return <h6 { ...attributes }>{ children }</h6>
            case 'list-item':
                return <li { ...attributes }>{ children }</li>
            case 'divider-line':
                return <div { ...attributes }><hr { ...attributes } /></div>
            default:
                return next()
        }
    }

    /**
     * On key down, check for our specific key shortcuts.
     *
     * @param {Event} event
     * @param {Editor} editor
     * @param {Function} next
     */

    onKeyDown = (event, editor, next) => {
        switch (event.key) {
            case ' ':
                return this.onSpace(event, editor, next)
            case 'Backspace':
                return this.onBackspace(event, editor, next)
            case 'Enter':
                return this.onEnter(event, editor, next)
            default:
                return next()
        }
    }

    /**
     * On space, if it was after an auto-markdown shortcut, convert the current
     * node into the shortcut's corresponding type.
     *
     * @param {Event} event
     * @param {Editor} editor
     * @param {Function} next
     */

    onSpace = (event, editor, next) => {
        const { value } = editor
        const { selection } = value
        console.log(value)
        if (selection.isExpanded) return next() // 如果是选中状态的话则继续

        const { startBlock } = value
        // focusText
        const { start } = selection
        const chars = startBlock.text.slice(0, start.offset).replace(/\s*/g, '')
        const type = this.getType(chars)
        if (!type) return next()
        if (type === 'list-item' && startBlock.type === 'list-item') return next()
        event.preventDefault()

        editor.setBlocks(type)

        if (type === 'list-item') {
            editor.wrapBlock('bulleted-list')
        }

        editor.moveFocusToStartOfNode(startBlock).delete()
        if (type === 'divider-line') {
            console.log('1231')
            editor.splitBlock().setBlocks('paragraph')
            // return next()
        }
    }

    /**
     * On backspace, if at the start of a non-paragraph, convert it back into a
     * paragraph node.
     *
     * @param {Event} event
     * @param {Editor} editor
     * @param {Function} next
     */

    onBackspace = (event, editor, next) => {
        const { value } = editor
        const { selection } = value
        console.log(selection, value)
        // value.marks.forEach((item)=>{
        //     console.log(item)
        // })
        if (selection.isExpanded) return next()
        if (selection.start.offset !== 0) return next()
        const { startBlock } = value
        if (value.previousBlock.type === 'divider-line') {
            // 如果光标已经在最左侧,且上一个block是 divider,那么就把 divider 删除
            editor.delete(value.previousBlock)
            event.preventDefault()
            editor.setBlocks('paragraph')
            return
        }
        if (startBlock.type === 'paragraph') {
            return next()
        }
        event.preventDefault()
        editor.setBlocks('paragraph')
        console.log('fffff')

        if (startBlock.type === 'list-item') {
            editor.unwrapBlock('bulleted-list')
        }
    }

    /**
     * On return, if at the end of a node type that should not be extended,
     * create a new paragraph below it.
     *
     * @param {Event} event
     * @param {Editor} editor
     * @param {Function} next
     */

    onEnter = (event, editor, next) => {
        const { value } = editor
        const { selection } = value
        const { start, end, isExpanded } = selection
        if (isExpanded) return next()

        const { startBlock } = value
        console.log(start.offset, end.offset, startBlock.text.length)

        if (start.offset === 0 && startBlock.text.length === 0) {
            // 当光标在这个block最左侧且该block的text为空触发
            return this.onBackspace(event, editor, next) // 添加一行
        }

        if (end.offset !== startBlock.text.length) {
            return next()
        }

        if (
            startBlock.type !== 'heading-one' &&
            startBlock.type !== 'heading-two' &&
            startBlock.type !== 'heading-three' &&
            startBlock.type !== 'heading-four' &&
            startBlock.type !== 'heading-five' &&
            startBlock.type !== 'heading-six' &&
            startBlock.type !== 'block-quote'
        ) {
            return next()
        }

        event.preventDefault()
        editor.splitBlock().setBlocks('paragraph')
    }
    /**
   * Render a Slate mark.
   *
   * @param {Object} props
   * @return {Element}
   */
    renderMark = (props, editor, next) => {
        const { children, mark, attributes } = props

        switch (mark.type) {
            case 'bold':
                return <strong { ...attributes }>{ children }</strong>
            case 'code':
                return <code { ...attributes }>{ children }</code>
            case 'italic':
                return <em { ...attributes }>{ children }</em>
            case 'underlined':
                return <u { ...attributes }>{ children }</u>
            default:
                return next()
        }
    }
}

/**
 * Export.
 */

export default MarkdownShortcuts
