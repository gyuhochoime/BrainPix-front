import React, { lazy } from 'react';

import ReactQuill from 'react-quill-new';
import styles from '../../../pages/idea-market/ideaMarketRegister.module.scss';
const QuillEditor = lazy(() => import('../../common/quillEditor/QuillEditor'));

interface ContentEditorProps {
  value: string;
  onChange: (content: string) => void;
  quillRef: React.RefObject<ReactQuill>;
  modules: { [key: string]: object };
  formats: string[];
}

export const ContentEditor = ({
  value,
  onChange,
  quillRef,
}: ContentEditorProps) => {
  return (
    <div className={styles.formGroup}>
      <label
        htmlFor='editor'
        className={styles.visuallyHidden}>
        아이디어 내용
      </label>
      <QuillEditor
        ref={quillRef}
        id='editor'
        value={value}
        onChangeHandler={onChange}
        className={styles.editor}
        placeholder='아이디어 내용을 입력하세요. (필수)'
      />
    </div>
  );
};
