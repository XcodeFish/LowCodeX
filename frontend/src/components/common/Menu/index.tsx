import React, { useMemo } from 'react';
import { Menu as AntMenu } from 'antd';
import type { MenuProps as AntMenuProps } from 'antd/es/menu';
import { useNavigate, useLocation } from 'react-router-dom';
import './style.scss';

export interface MenuItemType {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  path?: string;
  children?: MenuItemType[];
}

export interface MenuProps extends Omit<AntMenuProps, 'items'> {
  /**
   * 菜单项配置
   */
  items: MenuItemType[];
  /**
   * 是否自动处理路由跳转
   */
  useRouter?: boolean;
  /**
   * 点击菜单项时的自定义处理函数
   */
  onMenuClick?: (key: string, item: MenuItemType) => void;
}

/**
 * 导航菜单组件，封装了Ant Design的Menu组件
 */
const Menu: React.FC<MenuProps> = ({
  items,
  useRouter = true,
  onMenuClick,
  ...restProps
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 当前选中的菜单项
  const selectedKeys = useMemo(() => {
    if (!useRouter) return undefined;

    const path = location.pathname;
    const matchedKeys: string[] = [];

    const findMatchedKey = (menuItems: MenuItemType[]) => {
      for (const item of menuItems) {
        if (item.path && path.startsWith(item.path)) {
          matchedKeys.push(item.key);
        }
        if (item.children) {
          findMatchedKey(item.children);
        }
      }
    };

    findMatchedKey(items);

    return matchedKeys.length > 0 ? [matchedKeys[matchedKeys.length - 1]] : [];
  }, [location.pathname, items, useRouter]);

  // 处理菜单点击事件
  const handleClick = (info: { key: string }) => {
    const { key } = info;

    // 查找点击的菜单项
    const findMenuItem = (menuItems: MenuItemType[]): MenuItemType | null => {
      for (const item of menuItems) {
        if (item.key === key) {
          return item;
        }
        if (item.children) {
          const found = findMenuItem(item.children);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    const clickedItem = findMenuItem(items);

    if (clickedItem) {
      // 调用自定义点击处理函数
      if (onMenuClick) {
        onMenuClick(key, clickedItem);
      }

      // 如果配置了路由自动跳转
      if (useRouter && clickedItem.path) {
        navigate(clickedItem.path);
      }
    }
  };

  return (
    <AntMenu
      className="custom-menu"
      selectedKeys={selectedKeys}
      onClick={handleClick}
      items={items}
      {...restProps}
    />
  );
};

export { Menu };
