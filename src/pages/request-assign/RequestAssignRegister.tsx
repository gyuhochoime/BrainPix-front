import React, { useState, useRef, useEffect, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './requestAssignRegister.module.scss';
import MainImage from '../../assets/icons/mainImage.svg?react';
import DownButton from '../../assets/icons/categoryDownButton.svg?react';
import UpButton from '../../assets/icons/categoryUpButton.svg?react';
import CheckButton from '../../assets/icons/checkButton.svg?react';
import DisabledCheckButton from '../../assets/icons/disabledCheckButton.svg?react';
import InfoDropdown from '../../assets/icons/infoDropdown.svg?react';
import { Image } from '../../components/common/image/Image';
import { MetaTag } from '../../seoMetaTag';
import ReactQuill from 'react-quill-new';

const QuillEditor = lazy(
  () => import('../../components/common/quillEditor/QuillEditor'),
);

interface RequestAssignRequestData {
  title: string;
  content: string;
  specialization: SpecializationType;
  openMyProfile: boolean;
  imageList: string[];
  attachmentFileList: string[];
  postAuth: PostAuth;
  recruitments: RequestTaskRecruitmentDto[];
  deadline: string;
  requestTaskType: RequestTaskType;
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

interface RequestTaskRecruitmentDto {
  domain: string;
  requestTaskPriceDto: RequestTaskPriceDto;
}

interface RequestTaskPriceDto {
  price: number;
  totalQuantity: number;
  paymentDuration: PaymentDurationType;
}

type PaymentDurationType =
  | 'ONCE'
  | 'MONTHLY'
  | 'WEEKLY'
  | 'DAILY'
  | 'NOT_APPLICABLE';

type RequestTaskType = 'OPEN_IDEA' | 'TECH_ZONE';

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

const RequestTaskTypeEnumMap: Record<string, RequestTaskType> = {
  OPEN_IDEA: 'OPEN_IDEA',
  TECH_ZONE: 'TECH_ZONE',
};

const BASE_URL = import.meta.env.VITE_BASE_URL;

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

interface RecruitmentField {
  id: number;
  field: string;
  numberOfPeople: number;
}

const RequestAssignRegisterNow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultPageType = location.state?.defaultPageType || 'OPEN_IDEA';
  const [category, setCategory] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [pageType, setPageType] = useState<'OPEN_IDEA' | 'TECH_ZONE'>(
    defaultPageType,
  );
  const [showDetail, setShowDetail] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [, setAttachedFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<
    '전체공개' | '기업공개' | '비공개'
  >('전체공개');
  const [isPortfolioVisible, setIsPortfolioVisible] = useState(false);
  const [recruitmentFields, setRecruitmentFields] = useState<
    RecruitmentField[]
  >([{ id: 1, field: '', numberOfPeople: 0 }]);

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
      { id: prev.length + 1, field: '', numberOfPeople: 0 },
    ]);
  };

  const handleFieldChange = (id: number, field: string) => {
    setRecruitmentFields((prev) =>
      prev.map((item) => (item.id === id ? { ...item, field } : item)),
    );
  };

  const handleNumberChange = (id: number, numberOfPeople: number) => {
    setRecruitmentFields((prev) =>
      prev.map((item) => (item.id === id ? { ...item, numberOfPeople } : item)),
    );
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

  const handleSubmit = async () => {
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

      const plainContent = content.replace(/<[^>]*>/g, '');

      const requestData: RequestAssignRequestData = {
        title: ideaNameInputRef.current?.value || '',
        content: plainContent,
        specialization: categoryToEnum[category],
        openMyProfile: isPortfolioVisible,
        imageList: imageUrl ? [imageUrl] : [],
        attachmentFileList: pdfUrl ? [pdfUrl] : [],
        postAuth: visibilityToEnum[visibility],
        recruitments:
          pageType === 'TECH_ZONE' && recruitmentFields.length > 0
            ? recruitmentFields.map((field) => ({
                domain: field.field || '기본 분야',
                requestTaskPriceDto: {
                  price:
                    field.numberOfPeople > 0
                      ? field.numberOfPeople * 1000
                      : 1000,
                  totalQuantity: field.numberOfPeople || 1,
                  paymentDuration: 'ONCE',
                },
              }))
            : [
                {
                  domain: '기본 분야',
                  requestTaskPriceDto: {
                    price: 1000,
                    totalQuantity: 1,
                    paymentDuration: 'ONCE',
                  },
                },
              ],
        deadline: deadlineString,
        requestTaskType:
          RequestTaskTypeEnumMap[
            pageType === 'OPEN_IDEA' ? 'OPEN_IDEA' : 'TECH_ZONE'
          ],
      };

      const response = await submitRequestAssign(requestData);
      navigate(`/request-assign/register-complete?postId=${response.id}`);
    } catch {
      alert('등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const submitRequestAssign = async (
    data: RequestAssignRequestData,
  ): Promise<{ id: number }> => {
    const requestData = {
      title: data.title,
      content: data.content,
      specialization: data.specialization,
      openMyProfile: data.openMyProfile,
      imageList: data.imageList,
      attachmentFileList: data.attachmentFileList,
      postAuth: data.postAuth,
      recruitments: data.recruitments.map((recruitment) => ({
        domain: recruitment.domain,
        requestTaskPriceDto: {
          price: recruitment.requestTaskPriceDto.price,
          totalQuantity: recruitment.requestTaskPriceDto.totalQuantity,
          paymentDuration: recruitment.requestTaskPriceDto.paymentDuration,
        },
      })),
      deadline: data.deadline,
      requestTaskType: data.requestTaskType,
    };

    const response = await fetch(`${BASE_URL}/request-tasks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`API 호출 실패`);
    }

    const responseData = await response.json();
    return { id: responseData.data.postId };
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
        description='요청 과제를 등록하고 직원 채용 없이 업무를 수행하세요.'
        keywords='요청과제, 요청 과제 등록'
        title='요청 과제 등록'
        url='/request-assign/register'
      />
      <div className={styles.container}>
        <div className={styles.title}>요청 과제 등록하기</div>
        <div className={styles.horizontalContainer}>
          <div className={`${styles.formGroup} ${styles.categoryGroup}`}>
            <div className={styles.labelWrapper}>
              <label htmlFor='category'>
                카테고리
                <span className={styles.required}>(필수)</span>
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

          <div className={`${styles.formGroup} ${styles.pageTypeGroup}`}>
            <div className={styles.labelWrapper}>
              <span id='pageTypeLabel'>
                페이지 설정
                <span className={styles.required}>(필수)</span>
              </span>
            </div>
            <div
              className={styles.pageTypeWrapper}
              role='group'
              aria-labelledby='pageTypeLabel'>
              <button
                className={`${styles.pageTypeButton} ${pageType === 'OPEN_IDEA' ? styles.active : ''}`}
                onClick={() => setPageType('OPEN_IDEA')}>
                Open Idea
              </button>
              <button
                className={`${styles.pageTypeButton} ${pageType === 'TECH_ZONE' ? styles.active : ''}`}
                onClick={() => setPageType('TECH_ZONE')}>
                Tech Zone
              </button>
            </div>

            {pageType === 'OPEN_IDEA' && (
              <div
                className={`${styles.pageDescription} ${showDetail ? styles.detail : ''}`}
                onClick={() => setShowDetail(!showDetail)}>
                <div className={styles.header}>
                  <span className={styles.descriptionText}>Open Idea란?</span>
                  <InfoDropdown
                    className={styles.infoIcon}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDetail(!showDetail);
                    }}
                  />
                </div>
                {showDetail && (
                  <div className={styles.detailDescription}>
                    <span className={styles.mainText}>
                      누구나 참여할 수 있는 창의적인 아이디어 과제
                    </span>
                    <span className={styles.subText}>
                      {`ex) '새로운 카페 브랜드를 위한 세련되고 기억에 남는 이름을 제안해주세요.'
                    '환경 보호를 주제로 한 캠페인을 위한 슬로건을 만들어주세요.'`}
                    </span>
                  </div>
                )}
              </div>
            )}

            {pageType === 'TECH_ZONE' && (
              <div
                className={`${styles.pageDescription} ${showDetail ? styles.detail : ''}`}
                onClick={() => setShowDetail(!showDetail)}>
                <div className={styles.header}>
                  <span className={styles.descriptionText}>Tech Zone이란?</span>
                  <InfoDropdown
                    className={styles.infoIcon}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDetail(!showDetail);
                    }}
                  />
                </div>
                {showDetail && (
                  <div className={styles.detailDescription}>
                    <span className={styles.mainText}>
                      전문 지식이 필요한 기술 중심 프로젝트
                    </span>
                    <span className={styles.subText}>
                      {` ex) '판매 데이터를 분석하여 다음 분기의 매출 예측 모델을 개발해주세요.'
                    '간단한 이커머스 웹사이트를 구축하고 결제 시스템을 연동해주세요.'`}
                    </span>
                  </div>
                )}
              </div>
            )}
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
              placeholder='과제명이에용..'
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

        {pageType === 'TECH_ZONE' && (
          <div className={styles.formGroup}>
            <div className={styles.labelWrapper}>
              모집 분야 및 인원 설정
              <span className={styles.required}>(필수)</span>
            </div>
            {recruitmentFields.map((field) => (
              <div
                key={field.id}
                className={styles.ideaNameWrapper}>
                <input
                  type='text'
                  placeholder='분야별 (텍스트)'
                  value={field.field}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className={styles.recruitmentFieldInput}
                />
                <input
                  type='text'
                  value={field.numberOfPeople || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleNumberChange(field.id, parseInt(value) || 0);
                  }}
                  placeholder='현재 인원 / 모집 인원'
                  className={styles.recruitmentFieldInput}
                />
                <input
                  type='text'
                  placeholder='제안 금액'
                  className={styles.recruitmentFieldInput}
                />
                <select
                  className={styles.periodSelect}
                  defaultValue='건당'>
                  <option value='건당'>건당</option>
                  <option value='일간'>일간</option>
                  <option value='주간'>주간</option>
                  <option value='월간'>월간</option>
                  <option value='추후협의'>추후 협의</option>
                </select>
              </div>
            ))}
            <div className={styles.recruitmentFieldButtons}>
              <button
                onClick={() => {
                  if (recruitmentFields.length > 1) {
                    setRecruitmentFields((prev) => prev.slice(0, -1));
                  }
                }}
                className={`${styles.deleteButton} ${
                  recruitmentFields.length > 1
                    ? styles.enabled
                    : styles.disabled
                }`}
                disabled={recruitmentFields.length <= 1}>
                <span>삭제하기</span>
              </button>
              <button
                onClick={handleAddField}
                className={styles.addButton}>
                <span>추가하기</span>
              </button>
            </div>
          </div>
        )}

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
      </div>
    </>
  );
};

export default RequestAssignRegisterNow;
