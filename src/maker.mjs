import fs from 'fs';
import fsPromises from 'fs/promises';

const makeModal = async (api, modalFolder) => {
  const data = {};
  const initData = {};
  const formData = [];
  api.keys().map((key) => {
    data[key] = `values.${key}`;
    initData[key] = `item?.${key}`;
    switch (api.apiAttributes()[key].type) {
      case 'boolean':
        formData.push(`
          <antd.Form.Item
              name="${key}"
              label="${key}"
              ${
                api.apiAttributes()[key].required
                  ? `rules={[{ required: true, message: '請輸入${key}' }]}`
                  : ''
              }
          >
            <antd.Switch defaultChecked={item?.${key}} />
          </antd.Form.Item>`);
        break;

      default:
        formData.push(`
              <antd.Form.Item
                  name="${key}"
                  label="${key}"
                  ${
                    api.apiAttributes()[key].required
                      ? `rules={[{ required: true, message: '請輸入${key}' }]}`
                      : ''
                  }
              >
                <antd.Input placeholder="請輸入${key}" />
              </antd.Form.Item>`);
        break;
    }
    return null;
  });

  const dataString = JSON.stringify(data).replace(/"/g, '');
  const initDataString = JSON.stringify(initData).replace(/"/g, '');

  const modalHtml = `import React from 'react';
      import * as antd from 'antd';
      
      import { AppContext } from '../AppContext';
      import { Notification } from '../components/Notification';
      
      export const AE${api.CollectionName()} = ({
        item,
        onSuccess,
      }: {
        item?: any;
        onSuccess: () => void;
      }) => {
        const appCtx = React.useContext(AppContext);
      
        const [spinning, setSpinning] = React.useState<boolean>(false);
  
        const onFinish = async (values: any) => {
          setSpinning(true);
  
          let data: any = null;
      
          if (item?.id) {
            data = await appCtx.fetch('put', '/api/${api.pluralName()}/' + item.id, {
              data:${dataString},
            });
          } else {
            data = await appCtx.fetch('post', '/api/${api.pluralName()}', {
              data:${dataString},
            });
          }
      
          if (data) {
            appCtx.setModal(null);
            Notification.add(
              'success',
              (item?.id ? '編輯' : '新增') + '${api.CollectionName()}成功',
            );
            onSuccess();
          }
          setSpinning(false);
        };
      
        return (
          <antd.Spin spinning={spinning}>
            <antd.Form
              initialValues={${initDataString}}
              onFinish={onFinish}
            >
              <h5 className="font-weight-bold mb-4">{item ? '編輯' : '新增'}</h5>
  
              ${formData.join('\n')}
      
              <antd.Form.Item className="text-center">
                <antd.Button type="primary" htmlType="submit">
                  確定
                </antd.Button>
              </antd.Form.Item>
            </antd.Form>
          </antd.Spin>
        );
      };
      `;

  if (!fs.existsSync(modalFolder)) {
    await fsPromises.mkdir(modalFolder);
  }

  await fsPromises.writeFile(`${modalFolder}/AE${api.CollectionName()}.tsx`, modalHtml);
};

const makePage = async (api, pagesFolder) => {
  const columns = api
    .keys()
    .filter(
      (key) =>
        api.apiAttributes()[key].type !== 'media' && api.apiAttributes()[key].type !== 'relation',
    )
    .map((key) => ({ title: key, align: 'center', dataIndex: key }));

  const columnString = JSON.stringify(columns).replace('[', '').replace(']', '');

  // eslint-disable-next-line no-param-reassign
  api.interface.createdAt = 'string';
  const Interface = ` interface ${api.CollectionName()} 
      ${JSON.stringify(api.interface).replace(/"/g, '')}
    `;

  const pageHtml = `import React from 'react';
      import { ColumnsType } from 'antd/lib/table';
      import * as antd from 'antd';
      import qs from 'qs';
      
      import { AppContext } from '../AppContext';
      import { AE${api.CollectionName()} } from '../modals/AE${api.CollectionName()}';
      import { DangerButton } from '../components/DangerButton';
      import dayjs from 'dayjs';
      
      const ${api.CollectionName()}Page = () => {
        const appCtx = React.useContext(AppContext);
      
        const [spinning, setSpinning] = React.useState<boolean>(false);
        const [dataSource, setDataSource] = React.useState<${api.CollectionName()}[]>([]); //coulmns data
        const [currentPage, setCurrentPage] = React.useState<number>(1);
        const [total, setTotal] = React.useState<number>(0);
        const pageSize = 10;
      
        const init = async (page = currentPage, title?: string) => {
          setSpinning(true);
          const qstring = {
            sort: 'createdAt:desc',
            ${api.populate().length > 0 ? `populate: ${JSON.stringify(api.populate())},` : ''}
            pagination: { page, pageSize },
          };
          const data = await appCtx.fetch(
            'get',
            '/api/${api.pluralName()}?' + qs.stringify(qstring),
          );
          if (data) {
            const temp = data.data.map((item: any) => {
              return {
                id: item.id,
                ...item.attributes,
              };
            });
      
            console.log(temp);
            setDataSource(temp);
            setTotal(data.meta.pagination.total);
            setCurrentPage(data.meta.pagination.page);
            setSpinning(false);
          }
        };
      
        React.useEffect(() => {
          appCtx.redirect();
        }, []);
      
        React.useEffect(() => {
          if (appCtx.jwt) {
            init();
          }
        }, [appCtx.jwt]);
      
        ${Interface}
      
        const delete${api.CollectionName()} = async (id: number) => {
          await appCtx.fetch('delete', \`/api/${api.pluralName()}/\${id}\`);
          init();
        };
      
        const columns: ColumnsType<${api.CollectionName()}> = [
          ${columnString},
          {
            title: '創建日期',
            align: 'center',
            render: (item) => (
              <>{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}</>
            ),
          },
          {
            title: '操作',
            align: 'center',
            width: 180,
            render: (item) => (
              <>
                <antd.Button
                  className="mr-3"
                  type="primary"
                  onClick={() =>
                    appCtx.setModal(<AE${api.CollectionName()} item={item} onSuccess={init} />)
                  }
                >
                  編輯
                </antd.Button>
                <DangerButton
                  title="刪除"
                  message="確定要刪除?"
                  onClick={() => delete${api.CollectionName()}(item.id)}
                />
              </>
            ),
          },
        ];
      
        return (
          <antd.Spin spinning={spinning}>
            <div className="flex mb-2">
              <antd.Input.Search
                placeholder="搜尋"
                onSearch={(value) => init(currentPage, value)}
                style={{ width: 200 }}
              />
      
              <div className="flex-1" />
              <antd.Button
                type="primary"
                onClick={() => appCtx.setModal(<AE${api.CollectionName()} onSuccess={init} />)}
              >
                新增
              </antd.Button>
            </div>
            <antd.Table
              dataSource={dataSource}
              columns={columns}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                onChange: (page) => init(page),
              }}
            />
          </antd.Spin>
        );
      };
      
      export { ${api.CollectionName()}Page };
      `;

  if (!fs.existsSync(pagesFolder)) {
    await fsPromises.mkdir(pagesFolder);
  }

  await fsPromises.writeFile(`${pagesFolder}/${api.CollectionName()}Page.tsx`, pageHtml);
};

export { makeModal, makePage };
