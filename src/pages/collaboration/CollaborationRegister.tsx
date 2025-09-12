import React, { useState, useRef, useEffect, lazy } from 'react';
import ReactQuill from 'react-quill-new';
import { useNavigate } from 'react-router-dom';
import styles from './collaborationRegister.module.scss';
import MainImage from '../../assets/icons/mainImage.svg?react';
import DownButton from '../../assets/icons/categoryDownButton.svg?react';
import UpButton from '../../assets/icons/categoryUpButton.svg?react';
import CheckButton from '../../assets/icons/checkButton.svg?react';
import DisabledCheckButton from '../../assets/icons/disabledCheckButton.svg?react';
import { Image } from '../../components/common/image/Image';
import { ConfirmModal } from '../../components/common/modal/ConfirmModal';
const QuillEditor = lazy(
  () => import('../../components/common/quillEditor/QuillEditor'),
);

interface CollaborationRequestData {
  title: string;
  content: string;
  specialization: SpecializationType;
  openMyProfile: boolean;
  imageList: string[];
  attachmentFileList: string[];
  postAuth: PostAuth;
  deadline: string;
  link: string;
  recruitments: CollaborationRecruitmentDto[];
  initialMembers: CollaborationHubInitialMemberDto[];
}

type SpecializationType =
  | 'ADVERTISING_PROMOTION'
  | 'DESIGN'
  | 'LESSON'
  | 'MARKETING'
  | 'DOCUMENT_WRITING'
  | 'MEDIA_CONTENT'
  | 'TRANSLATION_INTERPRETATION'
  | 'TAX_LAW_LABOR'
  | 'CUSTOM_PRODUCTION'
  | 'STARTUP_BUSINESS'
  | 'FOOD_BEVERAGE'
  | 'IT_TECH'
  | 'OTHERS';

type PostAuth = 'ALL' | 'COMPANY' | 'ME';

interface CollaborationRecruitmentDto {
  domain: string;
  gatheringDto: GatheringDto;
}

interface GatheringDto {
  totalQuantity: number;
}

interface CollaborationHubInitialMemberDto {
  domain: string;
  identifier: string;
}

const categoryToEnum: Record<string, SpecializationType> = {
  '광고 · 홍보': 'ADVERTISING_PROMOTION',
  디자인: 'DESIGN',
  레슨: 'LESSON',
  마케팅: 'MARKETING',
  '문서 · 글쓰기': 'DOCUMENT_WRITING',
  '미디어 · 콘텐츠': 'MEDIA_CONTENT',
  '번역 및 통역': 'TRANSLATION_INTERPRETATION',
  '세무 · 법무 · 노무': 'TAX_LAW_LABOR',
  주문제작: 'CUSTOM_PRODUCTION',
  '창업 · 사업': 'STARTUP_BUSINESS',
  '푸드 및 음료': 'FOOD_BEVERAGE',
  'IT · 테크': 'IT_TECH',
  기타: 'OTHERS',
};

const visibilityToEnum: Record<string, PostAuth> = {
  전체공개: 'ALL',
  기업공개: 'COMPANY',
  비공개: 'ME',
};

const BASE_URL = import.meta.env.VITE_BASE_URL;
import { MetaTag } from '../../seoMetaTag';

const OPTIONS = [
  '광고 · 홍보',
  '디자인',
  '레슨',
  '마케팅',
  '문서 · 글쓰기',
  '미디어 · 콘텐츠',
  '번역 및 통역',
  '세무 · 법무 · 노무',
  '주문제작',
  '창업 · 사업',
  '푸드 및 음료',
  'IT · 테크',
  '기타',
];

const CollaborationRegister = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [, setAttachedFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<
    '전체공개' | '기업공개' | '비공개'
  >('전체공개');
  const [link, setLink] = useState('');
  const [isPortfolioVisible, setIsPortfolioVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [recruitmentFields, setRecruitmentFields] = useState<
    CollaborationRecruitmentDto[]
  >([{ domain: '', gatheringDto: { totalQuantity: 0 } }]);

  const [initialMembers, setInitialMembers] = useState<
    CollaborationHubInitialMemberDto[]
  >([{ domain: '', identifier: '' }]);

  const [recruitmentDeadline, setRecruitmentDeadline] = useState({
    year: '',
    month: '',
    day: '',
  });

  const ideaNameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quillRef = useRef<ReactQuill>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewImageUrl(imageUrl);
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    }
  };

  const handleAddField = () => {
    setRecruitmentFields((prev) => [
      ...prev,
      { domain: '', gatheringDto: { totalQuantity: 0 } },
    ]);
  };

  const handleFieldChange = (index: number, domain: string) => {
    setRecruitmentFields((prev) =>
      prev.map((item, i) => (i === index ? { ...item, domain } : item)),
    );
  };

  const handleQuantityChange = (index: number, value: string) => {
    const numValue = value ? parseInt(value) : 0;
    setRecruitmentFields((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, gatheringDto: { totalQuantity: numValue } }
          : item,
      ),
    );
  };

  const handleAddInitialMember = () => {
    setInitialMembers((prev) => [...prev, { domain: '', identifier: '' }]);
  };

  const handleInitialMemberChange = (
    index: number,
    field: 'domain' | 'identifier',
    value: string,
  ) => {
    setInitialMembers((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleLoadProfile = async (index: number) => {
    try {
      const member = initialMembers[index];
      if (!member.identifier) {
        alert('아이디를 입력해주세요.');
        return;
      }

      const response = await fetch(
        `${BASE_URL}/collaborations/validate/${member.identifier}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error('프로필을 불러오는데 실패했습니다.');
      }

      const data = await response.json();

      if (data.success) {
        setInitialMembers((prev) =>
          prev.map((item, i) =>
            i === index
              ? {
                  ...item,
                  domain: item.domain || data.data?.domain || '',
                }
              : item,
          ),
        );
      } else {
        alert(data.message || '프로필을 불러오는데 실패했습니다.');
      }
    } catch {
      alert('프로필을 불러오는데 실패했습니다.');
    }
  };

  const handlePdfClick = () => {
    pdfInputRef.current?.click();
  };

  const handlePortfolioVisibility = () => {
    setIsPortfolioVisible((prev) => !prev);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const getPresignedUrl = async (file: File): Promise<string> => {
    const fileName = encodeURIComponent(file.name);
    const contentType = encodeURIComponent(file.type);

    const response = await fetch(
      `${BASE_URL}/files/presigned-url?fileName=${fileName}&contentType=${contentType}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Presigned URL 요청 실패 - 상태 코드: ${response.status}`,
      );
    }

    return await response.text();
  };

  const uploadImageToPresignedUrl = async (
    file: File,
    presignedUrl: string,
  ): Promise<string> => {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error(
        `이미지 Presigned URL 업로드 실패 - 상태 코드: ${response.status}`,
      );
    }

    return presignedUrl.split('?')[0];
  };

  const uploadPdfToPresignedUrl = async (
    file: File,
    presignedUrl: string,
  ): Promise<string> => {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': 'application/pdf',
      },
    });

    if (!response.ok) {
      throw new Error(`PDF 업로드 실패`);
    }

    return presignedUrl.split('?')[0];
  };

  const handleSubmit = () => {
    setIsModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      let imageUrl = '';
      let pdfUrl = '';

      const currentFileInput = fileInputRef.current;
      if (currentFileInput?.files && currentFileInput.files.length > 0) {
        const imageFile = currentFileInput.files[0];
        const presignedUrl = await getPresignedUrl(imageFile);
        imageUrl = await uploadImageToPresignedUrl(imageFile, presignedUrl);
      }

      if (pdfFile) {
        const pdfPresignedUrl = await getPresignedUrl(pdfFile);
        pdfUrl = await uploadPdfToPresignedUrl(pdfFile, pdfPresignedUrl);
      }

      const deadlineString = `${recruitmentDeadline.year}-${recruitmentDeadline.month.padStart(2, '0')}-${recruitmentDeadline.day.padStart(2, '0')} 14:30`;

      const requestData: CollaborationRequestData = {
        title: ideaNameInputRef.current?.value || '',
        content: content,
        specialization: categoryToEnum[category],
        openMyProfile: isPortfolioVisible,
        imageList: imageUrl ? [imageUrl] : [],
        attachmentFileList: pdfUrl ? [pdfUrl] : [],
        postAuth: visibilityToEnum[visibility],
        link: link,
        recruitments: recruitmentFields.map((field) => ({
          domain: field.domain,
          gatheringDto: {
            totalQuantity: field.gatheringDto.totalQuantity,
          },
        })),
        initialMembers: initialMembers.map((member) => ({
          domain: member.domain,
          identifier: member.identifier,
        })),
        deadline: deadlineString,
      };

      await submitRequestAssign(requestData);
      navigate('/collaboration');
    } catch {
      alert('등록에 실패했습니다. 다시 시도해주세요.');
    }
    setIsModalOpen(false);
  };

  const submitRequestAssign = async (
    data: CollaborationRequestData,
  ): Promise<{ id: number }> => {
    const response = await fetch(`${BASE_URL}/collaborations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API 호출 실패`);
    }

    return await response.json();
  };

  useEffect(() => {
    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
    };
  }, [previewImageUrl]);

  return (
    <>
      <MetaTag
        description='팀 빌딩 요청글을 작성하여 협업을 위한 구인을 해보세요.'
        keywords='팀 빌딩, 협업 구인, 협업 광장'
        title='팀 빌딩 요청'
        url='/collaboration/register'
      />
      <div className={styles.container}>
        <div className={styles.title}>팀 빌딩</div>
        <div className={styles.horizontalContainer}>
          <div className={`${styles.formGroup} ${styles.categoryGroup}`}>
            <div className={styles.labelWrapper}>
              <label htmlFor='category'>
                주제 분야 설정
                <span className={styles.required}> (필수)</span>
              </label>
            </div>
            <div
              className={styles.select}
              onClick={() => setIsDropdownOpen((prev) => !prev)}>
              <span>{category || '분야별'}</span>
              {isDropdownOpen ? <UpButton /> : <DownButton />}
              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  {OPTIONS.map((option) => (
                    <div
                      key={option}
                      className={styles.dropdownItem}
                      onClick={() => setCategory(option)}>
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <input
            id='fileInput'
            type='file'
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept='image/*'
          />
          {previewImageUrl ? (
            <div
              className={styles.imagePreviewContainer}
              onClick={handleImageUpload}
              role='button'
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleImageUpload();
                }
              }}>
              <Image
                src={previewImageUrl}
                alt='Selected'
                className={styles.imagePreview}
              />
            </div>
          ) : (
            <MainImage
              onClick={handleImageUpload}
              className={styles.mainImage}
            />
          )}
        </div>

        <div className={styles.formGroup}>
          <div className={styles.ideaNameWrapper}>
            <input
              ref={ideaNameInputRef}
              type='text'
              placeholder='팀 주제를 입력하세요. (필수)'
              className={styles.ideaNameInput}
            />
          </div>
        </div>

        <div className={styles.fileUploadGroup}>
          <div className={styles.fileUploadLabel}>
            <span className={styles.labelText}>링크 첨부</span>
          </div>
          <div className={styles.fileUploadBox}>
            <input
              type='text'
              placeholder='과제 링크를 임베드 하세요.'
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className={styles.ideaNameInput}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label
            htmlFor='editor'
            className={styles.visuallyHidden}>
            아이디어 내용
          </label>
          <QuillEditor
            ref={quillRef}
            id='editor'
            value={content}
            onChangeHandler={setContent}
            className={styles.editor}
            placeholder='아이디어 내용을 입력하세요. (필수)'
          />
        </div>

        <div className={styles.fileUploadGroup}>
          <div className={styles.fileUploadLabel}>
            <span className={styles.labelText}>첨부파일</span>
            <span className={styles.pdfText}>(PDF)</span>
            <div className={styles.pcButton}>
              <span>내 PC</span>
            </div>
          </div>
          <div
            className={styles.fileUploadBox}
            onClick={handlePdfClick}>
            <span className={styles.placeholder}>
              {pdfFile ? pdfFile.name : '파일이 업로드 되지 않았습니다.'}
            </span>
          </div>
          <input
            ref={pdfInputRef}
            type='file'
            accept='.pdf'
            onChange={handlePdfUpload}
            style={{ display: 'none' }}
          />
        </div>

        <div className={styles.formGroup}>
          <div className={styles.labelWrapper}>
            모집 분야 및 인원 설정
            <span className={styles.required}>(필수)</span>
          </div>
          {recruitmentFields.map((field, index) => (
            <div
              key={index}
              className={styles.ideaNameWrapper}>
              <input
                type='text'
                placeholder='역할 (텍스트)'
                value={field.domain}
                onChange={(e) => handleFieldChange(index, e.target.value)}
                className={styles.recruitmentFieldInput}
              />
              <input
                type='text'
                value={field.gatheringDto.totalQuantity || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  handleQuantityChange(index, value);
                }}
                placeholder='모집 인원'
                className={styles.recruitmentFieldInput}
              />
              <span
                className={styles.deleteText}
                onClick={() => {
                  setRecruitmentFields((prev) =>
                    prev.filter((_, i) => i !== index),
                  );
                }}>
                삭제
              </span>
            </div>
          ))}
          <div className={styles.recruitmentFieldButtons}>
            <button
              onClick={handleAddField}
              className={styles.addButton}>
              <span>추가하기</span>
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.labelWrapper}>
            프로젝트 개최 인원 정보
            <span className={styles.required}>(필수)</span>
          </div>
          {initialMembers.map((member, index) => (
            <div
              key={index}
              className={styles.projectMemberWrapper}>
              <input
                type='text'
                placeholder='아이디'
                value={member.identifier}
                onChange={(e) =>
                  handleInitialMemberChange(index, 'identifier', e.target.value)
                }
                className={styles.recruitmentFieldInput}
              />
              <input
                type='text'
                placeholder='역할 (텍스트)'
                value={member.domain}
                onChange={(e) =>
                  handleInitialMemberChange(index, 'domain', e.target.value)
                }
                className={styles.recruitmentFieldInput}
              />
              <button
                type='button'
                onClick={() => handleLoadProfile(index)}
                className={styles.profileLoadButton}>
                프로필 불러오기
              </button>
              <span
                className={styles.deleteText}
                onClick={() => {
                  setInitialMembers((prev) =>
                    prev.filter((_, i) => i !== index),
                  );
                }}>
                삭제
              </span>
            </div>
          ))}
          <div className={styles.recruitmentFieldButtons}>
            <button
              onClick={handleAddInitialMember}
              className={styles.addButton}>
              <span>추가하기</span>
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.labelWrapper}>
            모집 기한 설정 <span className={styles.required}>(필수)</span>
            <span className={styles.helperText}>*마감 일자를 입력해주세요</span>
          </div>
          <div className={styles.recruitmentDateContainer}>
            <div className={styles.recruitmentDateWrapper}>
              <input
                type='text'
                value={recruitmentDeadline.year}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setRecruitmentDeadline((prev) => ({ ...prev, year: value }));
                }}
                className={styles.recruitmentDateInput}
                placeholder='YYYY'
                maxLength={4}
              />
            </div>
            <span className={styles.recruitmentDateLabel}>년</span>

            <div className={styles.recruitmentDateWrapper}>
              <input
                type='text'
                value={recruitmentDeadline.month}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setRecruitmentDeadline((prev) => ({ ...prev, month: value }));
                }}
                className={styles.recruitmentDateInput}
                placeholder='MM'
                maxLength={2}
              />
            </div>
            <span className={styles.recruitmentDateLabel}>월</span>

            <div className={styles.recruitmentDateWrapper}>
              <input
                type='text'
                value={recruitmentDeadline.day}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setRecruitmentDeadline((prev) => ({ ...prev, day: value }));
                }}
                className={styles.recruitmentDateInput}
                placeholder='DD'
                maxLength={2}
              />
            </div>
            <span className={styles.recruitmentDateLabel}>일</span>
          </div>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.labelWrapper}>
            <span id='visibilityLabel'>
              공개 여부
              <span className={styles.required}>(필수)</span>
            </span>
          </div>
          <div className={styles.visibilityContainer}>
            <div className={styles.visibilityGroupWrapper}>
              <div className={styles.visibilityWrapper}>
                <button
                  className={`${styles.visibilityButton} ${visibility === '전체공개' ? styles.active : ''}`}
                  onClick={() => setVisibility('전체공개')}>
                  전체공개
                </button>
                <button
                  className={`${styles.visibilityButton} ${visibility === '기업공개' ? styles.active : ''}`}
                  onClick={() => setVisibility('기업공개')}>
                  기업공개
                </button>
                <button
                  className={`${styles.visibilityButton} ${visibility === '비공개' ? styles.active : ''}`}
                  onClick={() => setVisibility('비공개')}>
                  비공개
                </button>
              </div>
            </div>

            <div
              className={styles.portfolioVisibility}
              onClick={handlePortfolioVisibility}>
              {isPortfolioVisible ? <CheckButton /> : <DisabledCheckButton />}
              <span
                className={`${styles.portfolioText} ${isPortfolioVisible ? styles.active : ''}`}>
                프로필 공개
              </span>
              <button
                className={styles.editButton}
                onClick={handleEditClick}>
                <span>EDIT</span>
              </button>
            </div>
          </div>
        </div>

        <div className={styles.buttonWrapper}>
          <button
            onClick={handleCancel}
            className={styles.cancelButton}>
            취소
          </button>
          <button
            onClick={handleSubmit}
            className={styles.submitButton}>
            <span>등록</span>
          </button>
        </div>
        <ConfirmModal
          isOpen={isModalOpen}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </div>
    </>
  );
};

export default CollaborationRegister;
