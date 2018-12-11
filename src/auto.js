import AutoReplace from 'slate-auto-replace'
import { Editor } from 'slate-react'
import { Value } from 'slate'

import React from 'react'
import initialValueAsJson from './value.json'

// Add the plugin to your set of plugins...
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
const initialValue = Value.fromJSON(initialValueAsJson)

class Auto extends React.Component {

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
                plugins={ plugins }
                renderNode={ this.renderNode }
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

export default Auto