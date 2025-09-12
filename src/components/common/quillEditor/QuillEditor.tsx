import { forwardRef } from 'react';
import { QuillToolbar } from '../../my-page/portfolio/QuillToolbar';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface QuillEditorPropsType {
  className: string;
  onChangeHandler: (content: string) => void;
  id?: string;
  value?: string;
  placeholder?: string;
}

const QuillEditor = forwardRef<ReactQuill, QuillEditorPropsType>(
  ({ className, onChangeHandler, id, value, placeholder, ...rest }, ref) => {
    const modules = {
      toolbar: { container: '#toolbar' },
    };
    return (
      <div>
        <QuillToolbar />
        <ReactQuill
          modules={modules}
          placeholder={placeholder || '내용을 입력하세요'}
          onChange={onChangeHandler}
          id={id}
          value={value}
          ref={ref}
          {...rest}
          className={className}
        />
      </div>
    );
  },
);

QuillEditor.displayName = 'QuillEditor';
export default QuillEditor;
