import {
  ChangeEvent,
  forwardRef,
  lazy,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import styles from './portfolioDetailModal.module.scss';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import ReactQuill from 'react-quill-new';
import { v4 as uuidv4 } from 'uuid';

import {
  getPorfolioDetail,
  putPorfolioDetail,
  deletePorfolioDetail,
} from '../../../apis/portfolio';
import {
  EditProfilePayload,
  PortfolioDetailResponseType,
} from '../../../types/myPageType';
import {
  CATEGORY_LABELS,
  CATEGORY_MAPPER_TO_ENG,
} from '../../../constants/categoryMapper';
import ImageInput from '../../../assets/icons/imageInput.svg?react';
import { Dropdown } from '../../common/dropdown/Dropdown';
import { PORTFOLIO_DETAIL_INIT } from '../../../constants/initValues';
import { getPresignedURL } from '../../../apis/commonAPI';
import axios from 'axios';
import { ToastContext } from '../../../contexts/toastContext';
import { DeleteCheckModal } from './DeleteCheckModal';
import { Image } from '../../common/image/Image';
const QuillEditor = lazy(() => import('../../common/quillEditor/QuillEditor'));

interface PortfolioDetailModalPropsType {
  onClose: () => void;
  cardId: number;
  editable?: boolean;
}

export const PortfolioDetailModal = forwardRef<
  HTMLDivElement,
  PortfolioDetailModalPropsType
>(({ onClose, cardId, editable = true }, ref) => {
  const quillRef = useRef<ReactQuill>(null);
  const { errorToast, successToast } = useContext(ToastContext);
  const IMAGE_BASE_URL = import.meta.env.VITE_S3_URL;
  const queryClient = useQueryClient();

  const [editMode, setEditMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSpecializations, setSelectedSpecializations] = useState('');
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

  const { data: cardData, isPending: isCardDataPending } = useQuery({
    queryKey: ['clickedCardData'],
    queryFn: () => getPorfolioDetail(cardId),
    enabled: cardId !== -1,
  });

  const { mutate: putPortfolioMutate } = useMutation({
    mutationFn: (payload: EditProfilePayload) =>
      putPorfolioDetail(cardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clickedCardData'] });
      queryClient.resetQueries({ queryKey: ['myPortfolios'] });
      successToast('수정이 완료되었습니다.');
      onClose();
    },
    onError: () => errorToast('게시글 수정에 실패하였습니다.'),
  });

  const { mutate: deletePortfolioMutate } = useMutation({
    mutationFn: () => deletePorfolioDetail(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clickedCardData'] });
      queryClient.resetQueries({ queryKey: ['myPortfolios'] });
      successToast('삭제가 완료되었습니다.');
      onClose();
    },
    onError: () => errorToast('게시글 삭제에 실패하였습니다.'),
  });

  const { register, setValue, control, handleSubmit } = useForm({
    defaultValues: PORTFOLIO_DETAIL_INIT,
  });

  const imageLoader = async (image: File) => {
    const fileExt = image.name.split('.').pop();
    const safeFileName = `${uuidv4()}.${fileExt}`;

    try {
      const presignedURL = await getPresignedURL({
        fileName: encodeURIComponent(safeFileName),
        fileType: image.type,
      });
      await axios.put(presignedURL, image, {
        headers: { 'Content-Type': image.type },
      });
      return `${IMAGE_BASE_URL}/${safeFileName}`;
    } catch {
      errorToast(`업로드에 실패하였습니다`);
    }
  };

  useEffect(() => {
    if (cardData?.data) {
      setValue('title', cardData?.data.title || '');
      setValue('profileImage', cardData?.data.profileImage || '');
      setValue('specializations', cardData?.data.specializations || ['']);
      setValue('startDate', cardData?.data.startDate || '');
      setValue('endDate', cardData?.data.endDate || '');
      setValue('content', cardData?.data.content || '');
    }
  }, [cardData, setValue]);

  const { title, specializations, startDate, endDate, content, profileImage } =
    (cardData?.data as PortfolioDetailResponseType) ?? PORTFOLIO_DETAIL_INIT;

  const handleClickEditButton = () => {
    if (editMode) {
      return setEditMode(false);
    }
    setEditMode(true);
  };

  const handleSelectSpecialization = (option: string) => {
    setSelectedSpecializations(option);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue('title', e.target.value);
  };

  const handleSubmitHandler = async (payload: FieldValues) => {
    const updatedPayload = {
      ...payload,
      specializations: [CATEGORY_MAPPER_TO_ENG[selectedSpecializations]],
    };
    putPortfolioMutate(updatedPayload as EditProfilePayload);
  };

  const handleClickDeleteButton = async () => {
    deletePortfolioMutate();
  };

  const handleChangeImageInput = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files) return null;

    const result = await imageLoader(e.target.files?.[0]);
    if (result) {
      setSelectedImage(result);
      setValue('profileImage', result);
    }
  };

  return (
    <div>
      {isCardDataPending ? (
        <div>로딩 중</div>
      ) : (
        <div
          className={classNames(styles.container)}
          ref={ref}>
          <div className={classNames(styles.titleWrapper)}>
            {editMode ? (
              <input
                className={classNames(styles.titleInput)}
                type='text'
                placeholder='제목을 입력하세요.'
                {...register('title')}
                onChange={handleChange}
              />
            ) : (
              <h1 className={classNames(styles.title)}>{title}</h1>
            )}
            <button
              onClick={handleClickEditButton}
              className={classNames(
                'buttonOutlined-grey500',
                styles.editButton,
              )}>
              {!editMode && editable && '수정하기'}
            </button>
          </div>
          <hr className={classNames(styles.titleDivider)} />
          {editMode ? (
            <form
              className={classNames(styles.contentContainer)}
              onSubmit={handleSubmit(handleSubmitHandler)}>
              <div className={classNames(styles.imageInputWrapper)}>
                <Image
                  alt='포트폴리오 이미지'
                  src={selectedImage || profileImage}
                  className={classNames(styles.imageInputLabel)}
                />
                <label htmlFor='imageInput'>
                  <div className={classNames(styles.imageInputLabel)}>
                    <ImageInput
                      width={48}
                      height={48}
                    />
                    대표사진
                  </div>
                  <input
                    id='imageInput'
                    type='file'
                    alt='이미지'
                    accept='image/*'
                    className={classNames(styles.imageInput)}
                    {...register('profileImage')}
                    onChange={handleChangeImageInput}
                  />
                </label>
              </div>
              <div className={classNames(styles.infoInputWrapper)}>
                <div className={classNames(styles.categoryInputWrapper)}>
                  <h3 className={classNames(styles.inputTitle)}>카테고리</h3>
                  <Dropdown
                    onSelect={handleSelectSpecialization}
                    selectedBoxClassName={styles.categoryDropdown}
                    optionBoxClassName={styles.categoryOptionsBoxDropdown}
                  />
                </div>
                <div>
                  <h3 className={classNames(styles.inputTitle)}>
                    프로젝트 기간
                  </h3>
                  <div className={classNames(styles.dateInputWrapper)}>
                    <input
                      placeholder='시작 날짜 선택'
                      className={classNames(styles.dateInput)}
                      {...register('startDate')}
                    />
                    <hr className={classNames(styles.divider)} />
                    <input
                      placeholder='종료 날짜 선택'
                      className={classNames(styles.dateInput)}
                      {...register('endDate')}
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className={classNames(styles.inputTitle)}>
                  포트폴리오 내용
                </div>
                <div className={classNames(styles.contentInputWrapper)}>
                  <Controller
                    name='content'
                    control={control}
                    render={({ field }) => (
                      <QuillEditor
                        {...field}
                        ref={quillRef}
                        className={classNames(styles.textInput)}
                        placeholder='내용을 입력하세요'
                        onChangeHandler={(content: string) =>
                          field.onChange(content)
                        }
                      />
                    )}
                  />
                </div>
              </div>
              <div className={classNames(styles.uploadButtonWrapper)}>
                <button
                  type='button'
                  onClick={onClose}
                  className={classNames(styles.cancelButton)}>
                  닫기
                </button>
                <button
                  type='submit'
                  className={classNames(
                    'buttonFilled-primary',
                    styles.uploadButton,
                  )}>
                  수정 완료
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className={classNames(styles.contentContainer)}>
                <div
                  className={classNames(styles.infoContainer, {
                    [styles.editMode]: editMode,
                  })}>
                  <div className={classNames(styles.infoWrapper)}>
                    <span>카테고리 </span>
                    <hr className={classNames(styles.infoDivider)} />
                    <div>{CATEGORY_LABELS[specializations[0]]}</div>
                  </div>

                  <div className={classNames(styles.infoWrapper)}>
                    <span>프로젝트 기간 </span>
                    <hr className={classNames(styles.infoDivider)} />
                    <div>
                      {startDate} - {endDate}
                    </div>
                  </div>
                </div>
                <div className={classNames(styles.imageInputWrapper)}>
                  <Image
                    alt='포트폴리오 사진'
                    src={profileImage}
                    className={classNames(styles.imageInputLabel)}
                  />
                </div>
                <div className={classNames(styles.titleWrapper)}>
                  <h1 className={classNames(styles.title)}>포트폴리오 내용</h1>
                </div>
                <div
                  className={classNames(styles.contentInput)}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
                <div className={classNames(styles.uploadButtonWrapper)}>
                  <button
                    type='button'
                    onClick={onClose}
                    className={classNames(styles.cancelButton)}>
                    닫기
                  </button>
                  {editable && (
                    <button
                      onClick={() => setIsOpenDeleteModal(true)}
                      type='button'
                      className={classNames(
                        'buttonFilled-primary',
                        styles.uploadButton,
                      )}>
                      삭제하기
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
          {isOpenDeleteModal && (
            <DeleteCheckModal
              onCancle={() => setIsOpenDeleteModal(false)}
              onDelete={handleClickDeleteButton}
            />
          )}
        </div>
      )}
    </div>
  );
});

PortfolioDetailModal.displayName = 'PortfolioDetailModal';
