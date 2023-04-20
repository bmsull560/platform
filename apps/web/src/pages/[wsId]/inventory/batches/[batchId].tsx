import { ReactElement, useEffect, useState } from 'react';
import HeaderX from '../../../../components/metadata/HeaderX';
import { PageWithLayoutProps } from '../../../../types/PageWithLayoutProps';
import { enforceHasWorkspaces } from '../../../../utils/serverless/enforce-has-workspaces';
import NestedLayout from '../../../../components/layouts/NestedLayout';
import useSWR from 'swr';
import { Divider, NumberInput } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import WarehouseSelector from '../../../../components/selectors/WarehouseSelector';
import { Product } from '../../../../types/primitives/Product';
import SupplierSelector from '../../../../components/selectors/SupplierSelector';
import { openModal } from '@mantine/modals';
import { ProductBatch } from '../../../../types/primitives/ProductBatch';
import { useRouter } from 'next/router';
import BatchDeleteModal from '../../../../components/loaders/batches/BatchDeleteModal';
import BatchEditModal from '../../../../components/loaders/batches/BatchEditModal';
import { useSegments } from '../../../../hooks/useSegments';
import { useWorkspaces } from '../../../../hooks/useWorkspaces';
import BatchProductInput from '../../../../components/inputs/BatchProductInput';

export const getServerSideProps = enforceHasWorkspaces;

const BatchDetailsPage: PageWithLayoutProps = () => {
  const router = useRouter();

  const { setRootSegment } = useSegments();
  const { ws } = useWorkspaces();

  const { wsId, batchId } = router.query;

  const batchApiPath =
    wsId && batchId
      ? `/api/workspaces/${wsId}/inventory/batches/${batchId}`
      : null;

  const productsApiPath =
    wsId && batchId
      ? `/api/workspaces/${wsId}/inventory/batches/${batchId}/products`
      : null;

  const { data: batch } = useSWR<ProductBatch>(batchApiPath);
  const { data: batchProducts } = useSWR<Product[]>(productsApiPath);

  useEffect(() => {
    setRootSegment(
      ws
        ? [
            {
              content: ws?.name || 'Tổ chức không tên',
              href: `/${ws.id}`,
            },
            { content: 'Kho hàng', href: `/${ws.id}/inventory` },
            {
              content: 'Lô hàng',
              href: `/${ws.id}/inventory/batches`,
            },
            {
              content: batch?.id || 'Đang tải...',
              href: `/${ws.id}/inventory/batches/${batch?.id}`,
            },
          ]
        : []
    );

    return () => setRootSegment([]);
  }, [ws, batch?.id, setRootSegment]);

  const [warehouseId, setWarehouseId] = useLocalStorage({
    key: 'warehouse-id',
    defaultValue: '',
  });

  const [supplierId, setSupplierId] = useLocalStorage({
    key: 'supplier-id',
    defaultValue: '',
  });

  const [price, setPrice] = useState<number | ''>('');

  useEffect(() => {
    if (batch) {
      setWarehouseId(batch?.warehouse_id || '');
      setSupplierId(batch?.supplier_id || '');
      setPrice(batch?.price || 0);
    }
  }, [batch, setWarehouseId, setSupplierId, setPrice]);

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (batchProducts) setProducts(batchProducts);
  }, [batchProducts]);

  const allProductsValid = () =>
    products.every(
      (product) =>
        product.id.length > 0 && product?.amount && product?.price !== undefined
    );

  const hasData = () => !!batch && !!batchProducts;

  const hasRequiredFields = () =>
    warehouseId.length > 0 &&
    supplierId.length > 0 &&
    hasData() &&
    allProductsValid();

  const removePrice = (index: number) => {
    setProducts((products) => products.filter((_, i) => i !== index));
  };

  const showEditModal = () => {
    if (!batch || !batchProducts) return;
    if (typeof batchId !== 'string') return;
    if (!ws?.id) return;

    openModal({
      title: <div className="font-semibold">Cập nhật sản phẩm</div>,
      centered: true,
      closeOnEscape: false,
      closeOnClickOutside: false,
      withCloseButton: false,
      children: (
        <BatchEditModal
          wsId={ws.id}
          oldProducts={batchProducts}
          oldBatch={batch}
          products={
            products.map((product) => ({
              ...product,
              warehouse_id: warehouseId,
            })) || []
          }
          batch={{
            id: batchId,
            price: Number(price),
            supplier_id: supplierId,
            warehouse_id: warehouseId,
          }}
        />
      ),
    });
  };

  const showDeleteModal = () => {
    if (!batch || !batchProducts) return;
    if (typeof batchId !== 'string') return;
    if (!ws?.id) return;

    openModal({
      title: <div className="font-semibold">Xóa sản phẩm</div>,
      centered: true,
      closeOnEscape: false,
      closeOnClickOutside: false,
      withCloseButton: false,
      children: (
        <BatchDeleteModal
          wsId={ws.id}
          batchId={batchId}
          products={batchProducts}
        />
      ),
    });
  };

  const addEmptyProduct = () => {
    setProducts((products) => [
      ...products,
      {
        id: '',
      },
    ]);
  };

  const updateProduct = (index: number, product: Product) =>
    setProducts((products) =>
      products.map((p, i) => (i === index ? product : p))
    );

  const getUniqueIds = () => {
    const ids = new Set<string>();

    products.forEach((product) => {
      if (product.id && product.unit_id)
        ids.add(`${product.id}::${product.unit_id}`);
    });

    return Array.from(ids);
  };

  return (
    <>
      <HeaderX label="Sản phẩm – Kho hàng" />
      <div className="mt-2 flex min-h-full w-full flex-col pb-8">
        <div className="grid gap-x-8 gap-y-4">
          <div className="flex items-end justify-end gap-2">
            <button
              className={`rounded border border-red-300/10 bg-red-300/10 px-4 py-1 font-semibold text-red-300 transition ${
                batch && batchProducts
                  ? 'hover:bg-red-300/20'
                  : 'cursor-not-allowed opacity-50'
              }`}
              onClick={batch && batchProducts ? showDeleteModal : undefined}
            >
              Xoá
            </button>

            <button
              className={`rounded border border-blue-300/10 bg-blue-300/10 px-4 py-1 font-semibold text-blue-300 transition ${
                hasRequiredFields()
                  ? 'hover:bg-blue-300/20'
                  : 'cursor-not-allowed opacity-50'
              }`}
              onClick={hasRequiredFields() ? showEditModal : undefined}
            >
              Lưu thay đổi
            </button>
          </div>
        </div>

        <Divider className="my-4" />
        <div className="grid gap-x-8 gap-y-4 lg:grid-cols-4 xl:gap-x-16">
          <div className="grid h-fit gap-2">
            <div className="col-span-full">
              <div className="text-2xl font-semibold">Thông tin cơ bản</div>
              <Divider className="my-2" variant="dashed" />
            </div>

            <WarehouseSelector
              warehouseId={warehouseId}
              setWarehouseId={setWarehouseId}
              disabled
              required
            />

            <SupplierSelector
              supplierId={supplierId}
              setSupplierId={setSupplierId}
              required
            />

            <NumberInput
              label="Giá nhập lô"
              placeholder="Nhập giá lô hàng"
              value={price}
              onChange={setPrice}
              className="w-full"
              classNames={{
                input: 'bg-white/5 border-zinc-300/20 font-semibold',
              }}
              min={0}
              parser={(value) => value?.replace(/\$\s?|(,*)/g, '') || ''}
              formatter={(value) =>
                !Number.isNaN(parseFloat(value || ''))
                  ? (value || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  : ''
              }
            />
          </div>

          <div className="grid h-fit gap-x-4 gap-y-2 lg:col-span-3">
            <div className="col-span-full">
              <div className="text-2xl font-semibold">Sản phẩm</div>
              <Divider className="mb-4 mt-2" variant="dashed" />

              <button
                className="rounded border border-blue-300/10 bg-blue-300/10 px-4 py-1 font-semibold text-blue-300 transition hover:bg-blue-300/20"
                onClick={addEmptyProduct}
              >
                + Thêm sản phẩm
              </button>
            </div>

            {products.map((p, idx) => (
              <BatchProductInput
                warehouseId={warehouseId}
                key={p.id + idx}
                product={p}
                getUniqueUnitIds={getUniqueIds}
                updateProduct={(product) => updateProduct(idx, product)}
                removePrice={() => removePrice(idx)}
                isLast={idx === products.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

BatchDetailsPage.getLayout = function getLayout(page: ReactElement) {
  return <NestedLayout noTabs>{page}</NestedLayout>;
};

export default BatchDetailsPage;
