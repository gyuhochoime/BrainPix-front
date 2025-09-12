import React, { useState, useRef, useEffect, lazy } from 'react';
import ReactQuill from 'react-quill-new';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ideaMarketRegister.module.scss';
import MainImage from '../../assets/icons/mainImage.svg?react';
import DownButton from '../../assets/icons/categoryDownButton.svg?react';
import UpButton from '../../assets/icons/categoryUpButton.svg?react';
import DisabledDownButton from '../../assets/icons/disabledDownButton.svg?react';
import CheckButton from '../../assets/icons/checkButton.svg?react';
import DisabledCheckButton from '../../assets/icons/disabledCheckButton.svg?react';
import InfoDropdown from '../../assets/icons/infoDropdown.svg?react';
import { Image } from '../../components/common/image/Image';
import { MetaTag } from '../../seoMetaTag';

const QuillEditor = lazy(
  () => import('../../components/common/quillEditor/QuillEditor'),
);

interface IdeaMarketRequestData {
  title: string;
  content: string;
  specialization: SpecializationType;
  openMyProfile: boolean;
  imageList: string[];
  attachmentFileList: string[];
  postAuth: PostAuth;
  ideaMarketType: IdeaMarketType;
  priceDto: IdeaMarketPriceDto;
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

type IdeaMarketType = 'IDEA_SOLUTION' | 'MARKET_PLACE';

interface IdeaMarketPriceDto {
  price: number;
  totalQuantity: number;
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

const pageTypeToEnum: Record<string, IdeaMarketType> = {
  'Idea Solution': 'IDEA_SOLUTION',
  'Market Place': 'MARKET_PLACE',
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

const IdeaMarketRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultPageType = location.state?.defaultPageType || 'Idea Solution';
  const [category, setCategory] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [pageType, setPageType] = useState<'Idea Solution' | 'Market Place'>(
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
  const [price, setPrice] = useState<string>('0');
  const [quantity, setQuantity] = useState<number>(1);
  const [isPortfolioVisible, setIsPortfolioVisible] = useState(false);

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

  const handlePdfClick = () => {
    pdfInputRef.current?.click();
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPrice(value);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const numberValue = value === '' ? 0 : parseInt(value, 10);
    setQuantity(numberValue);
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 0 ? prev - 1 : 0));
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
    try {
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

      const presignedUrl = await response.text();
      return presignedUrl;
    } catch {
      throw Error;
    }
  };

  const uploadImageToPresignedUrl = async (
    file: File,
    presignedUrl: string,
  ): Promise<string> => {
    try {
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

      const imageUrl = presignedUrl.split('?')[0];
      return imageUrl;
    } catch {
      throw Error;
    }
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

      const requestData: IdeaMarketRequestData = {
        title: ideaNameInputRef.current?.value || '',
        content: content.substring(0, 50000),
        specialization: categoryToEnum[category],
        openMyProfile: isPortfolioVisible,
        postAuth: visibilityToEnum[visibility],
        ideaMarketType: pageTypeToEnum[pageType],
        priceDto: {
          price: parseInt(price),
          totalQuantity: quantity,
        },
        imageList: imageUrl ? [imageUrl] : [],
        attachmentFileList: pdfUrl ? [pdfUrl] : [],
      };

      const response = await submitIdeaMarket(requestData);
      navigate(`/idea-market/register-complete?postId=${response.id}`);
    } catch {
      alert('등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const submitIdeaMarket = async (
    data: IdeaMarketRequestData,
  ): Promise<{ id: number }> => {
    const requestData = {
      title: data.title,
      content: data.content,
      specialization: data.specialization,
      openMyProfile: data.openMyProfile,
      postAuth: data.postAuth,
      ideaMarketType: data.ideaMarketType,
      priceDto: {
        price: data.priceDto.price,
        totalQuantity: data.priceDto.totalQuantity,
      },
      imageList: data.imageList,
      attachmentFileList: data.attachmentFileList,
    };

    const response = await fetch(`${BASE_URL}/idea-markets`, {
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

  // const modules = useMemo(() => {
  //   return {
  //     toolbar: {
  //       container: [
  //         [{ font: [] }, { size: [] }, { align: [] }],
  //         ['link', 'image'],
  //       ],
  //       handlers: {
  //         image: () => {
  //           const input = document.createElement('input');
  //           input.setAttribute('type', 'file');
  //           input.setAttribute('accept', 'image/*');
  //           input.click();

  //           input.onchange = async () => {
  //             const file = input.files?.[0];
  //             if (file) {
  //               if (file.size > MAX_FILE_SIZE) {
  //                 alert('이미지 파일 크기는 5MB를 초과할 수 없습니다.');
  //                 return;
  //               }

  //               const reader = new FileReader();
  //               reader.onload = () => {
  //                 const quill = quillRef.current?.getEditor();
  //                 if (quill) {
  //                   const range = quill.getSelection(true);
  //                   quill.insertEmbed(range.index, 'image', reader.result);
  //                 }
  //               };
  //               reader.readAsDataURL(file);
  //             }
  //           };
  //         },
  //       },
  //     },
  //   };
  // }, []);

  return (
    <>
      <MetaTag
        description='내 아이디어를 등록하고 상품으로 판매해보세요.'
        keywords='아이디어 솔루션, 아이디어 거래 아이디어 등록'
        title='아이디어 등록'
        url='/idea-market/register'
      />
      <div className={styles.container}>
        <div className={styles.title}>아이디어 등록하기</div>
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
                className={`${styles.pageTypeButton} ${pageType === 'Idea Solution' ? styles.active : ''}`}
                onClick={() => setPageType('Idea Solution')}>
                Idea Solution
              </button>
              <button
                className={`${styles.pageTypeButton} ${pageType === 'Market Place' ? styles.active : ''}`}
                onClick={() => setPageType('Market Place')}>
                Market Place
              </button>
            </div>

            {pageType === 'Idea Solution' && (
              <div
                className={`${styles.pageDescription} ${showDetail ? styles.detail : ''}`}
                onClick={() => setShowDetail(!showDetail)}>
                <div className={styles.header}>
                  <span className={styles.descriptionText}>
                    Idea Solution이란?
                  </span>
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
                      전문가가 제공하는 과제 제작 서비스
                    </span>
                    <span className={styles.subText}>
                      {`ex) '블로그 제작을 도와드립니다.' / '로고 제작 서비스를 제공합니다.'`}
                    </span>
                  </div>
                )}
              </div>
            )}

            {pageType === 'Market Place' && (
              <div
                className={`${styles.pageDescription} ${showDetail ? styles.detail : ''}`}
                onClick={() => setShowDetail(!showDetail)}>
                <div className={styles.header}>
                  <span className={styles.descriptionText}>
                    Market Place란?
                  </span>
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
                      완성된 과제물과 창의적인 제품을 거래하는 공간
                    </span>
                    <span className={styles.subText}>
                      {`ex) '어르신 맞춤형 키오스크 로봇' / '다이어트 식단 관리 앱 개발'`}
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
              placeholder='아이디어명 입니다'
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

        <div className={styles.priceQuantityContainer}>
          <div className={styles.priceGroup}>
            <div className={styles.priceLabel}>
              책정 금액
              <span className={styles.required}>(필수)</span>
            </div>
            <div className={styles.inputWrapper}>
              <input
                type='text'
                value={price}
                onChange={handlePriceChange}
                className={styles.input}
              />
              <span className={styles.unit}>원</span>
            </div>
          </div>

          {pageType === 'Market Place' && (
            <div className={styles.quantityGroup}>
              <div className={styles.quantityLabel}>
                수량 설정
                <span className={styles.required}>(필수)</span>
              </div>
              <div className={styles.inputWrapper}>
                <input
                  type='text'
                  value={quantity}
                  onChange={handleQuantityChange}
                  className={styles.input}
                />
                <span className={styles.unit}>개</span>
                <div className={styles.quantityControlWrapper}>
                  <button
                    onClick={handleIncrement}
                    className={styles.quantityButton}>
                    <UpButton />
                  </button>
                  <button
                    onClick={handleDecrement}
                    className={styles.quantityButton}
                    disabled={quantity === 0}>
                    {quantity === 0 ? <DisabledDownButton /> : <DownButton />}
                  </button>
                </div>
              </div>
            </div>
          )}
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
      </div>
    </>
  );
};

export default IdeaMarketRegister;
