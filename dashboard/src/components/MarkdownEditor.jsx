import MDEditor from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'
import { useState } from 'react'

const MarkdownEditor = ({ value, onChange }) => {
	const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'))

	// Observe dark mode changes
	const observer = new MutationObserver(() => {
		setDarkMode(document.documentElement.classList.contains('dark'))
	})
	observer.observe(document.documentElement, { attributes: true })

	return (
		<div data-color-mode={darkMode ? 'dark' : 'light'}>
			<MDEditor
				value={value}
				onChange={onChange}
				height={400}
				visibleDragbar={false}
			/>
		</div>
	)
}

export default MarkdownEditor
