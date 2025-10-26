import { Button, Badge, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react'
import { Menu, Bot, Bell, ChevronDown } from 'lucide-react'
import ConnectionStatus from './ConnectionStatus'

const Header = ({ onMenuClick, onChatClick }) => {
  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        {/* Top Row */}
        <div className="h-14 flex items-center justify-between px-4">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-banorte-red to-red-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-bold text-banorte-gray text-sm">tu asesor financiero</span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Badge content="3" color="danger" shape="circle" size="sm">
              <Button isIconOnly variant="light" size="sm">
                <Bell size={20} />
              </Button>
            </Badge>

            {/* User Avatar */}
            <Avatar
              src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
              size="sm"
              className="cursor-pointer w-8 h-8"
            />
          </div>
        </div>

        {/* Company Selector Row */}
        <div className="h-10 flex items-center px-4 border-t border-gray-100 bg-gray-50">
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="light" 
                size="sm"
                className="text-banorte-gray font-semibold min-w-0 px-2"
                endContent={<ChevronDown size={14} />}
              >
                Empresa E001
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Seleccionar empresa">
              <DropdownItem key="e001">Empresa E001</DropdownItem>
              <DropdownItem key="e002">Empresa E002</DropdownItem>
              <DropdownItem key="e003">Empresa E003</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex h-16 bg-white border-b border-gray-200 items-center justify-between px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="light"
            onPress={onMenuClick}
            className="text-banorte-gray"
          >
            <Menu size={20} />
          </Button>
          
          {/* Company Selector */}
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered" className="border-banorte-gray">
                Empresa E001
                <ChevronDown size={16} className="ml-1" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Seleccionar empresa">
              <DropdownItem key="e001">Empresa E001</DropdownItem>
              <DropdownItem key="e002">Empresa E002</DropdownItem>
              <DropdownItem key="e003">Empresa E003</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <ConnectionStatus />
          
          {/* AI Chat Button - Desktop */}
          <Button
            color="primary"
            variant="flat"
            onPress={onChatClick}
            className="hidden lg:flex"
            startContent={<Bot size={18} />}
          >
            Chat CFO IA
          </Button>

          {/* Notifications */}
          <Badge content="3" color="danger" shape="circle">
            <Button isIconOnly variant="light">
              <Bell size={20} />
            </Button>
          </Badge>

          {/* User Avatar */}
          <Avatar
            src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
            size="sm"
            className="cursor-pointer"
          />
        </div>
      </header>
    </>
  )
}

export default Header
