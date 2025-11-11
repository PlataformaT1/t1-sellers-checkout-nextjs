'use client'

import React, { useState } from 'react';
import { 
  AmountInput,
  Button,
  CustomInput,
  Chip,
  SearchInput,
  Select,
  CheckBox,
  Table,
  CustomPagination
} from "@t1-org/t1components";
import { useForm, FormProvider } from 'react-hook-form';
import { Box, Stack, Typography, Paper, Divider, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

type FormValues = {
  amount: number;
  email: string;
  search: string;
  bio: string;
  country: string;
};

const Home: React.FC = () => {
  const [chipSelected, setChipSelected] = useState(false);
  
  const methods = useForm<FormValues>({
    defaultValues: {
      amount: 0,
      email: '',
      search: '',
      bio: '',
      country: 'usa'
    }
  });

  return (<>
     <div className='w-[100%] p-8 mt-10'>
      <FormProvider {...methods}>
        <div className="space-y-12">
          
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">T1Components Library</h1>
            <p className="text-lg text-gray-600">Demostración de componentes disponibles</p>
          </div>

          {/* AmountInput Components */}
          <Paper elevation={2} sx={{ p: 4, borderRadius: '12px' }}>
            <Typography variant="h4" gutterBottom className="mb-6">
              AmountInput
            </Typography>
            <p className="text-gray-600 mb-6">Componente para entrada de montos con formato de moneda</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Box>
                <h4 className="font-semibold mb-2">Default</h4>
                <p className="text-sm text-gray-600 mb-3">Input básico con símbolo $ por defecto</p>
                <AmountInput<FormValues>
                  name="amount"
                  label="Amount"
                  control={methods.control}
                  textFieldProps={{
                    placeholder: 'Enter amount',
                    fullWidth: true
                  }}
                />
              </Box>

              <Box>
                <h4 className="font-semibold mb-2">With Currency</h4>
                <p className="text-sm text-gray-600 mb-3">Input con moneda personalizada (€)</p>
                <AmountInput<FormValues>
                  name="amount"
                  label="Price"
                  currency="€"
                  control={methods.control}
                  textFieldProps={{
                    placeholder: 'Enter price in euros',
                    fullWidth: true
                  }}
                />
              </Box>

              <Box>
                <h4 className="font-semibold mb-2">With Tooltip</h4>
                <p className="text-sm text-gray-600 mb-3">Input con información adicional</p>
                <AmountInput<FormValues>
                  name="amount"
                  label="Budget"
                  tooltip="Enter your maximum budget"
                  control={methods.control}
                  textFieldProps={{
                    placeholder: 'Enter budget',
                    fullWidth: true
                  }}
                />
              </Box>
            </div>
          </Paper>

          {/* Button Components */}
          <Paper elevation={2} sx={{ p: 4, borderRadius: '12px' }}>
            <Typography variant="h4" gutterBottom className="mb-6">
              Button
            </Typography>
            <p className="text-gray-600 mb-6">Botón avanzado con múltiples estados y funcionalidades</p>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-4">Variantes</h4>
                <div className="flex flex-wrap gap-4">
                  <Button variant="contained">Contained</Button>
                  <Button variant="outlined">Outlined</Button>
                  <Button variant="text">Text</Button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Colores</h4>
                <div className="flex flex-wrap gap-4">
                  <Button color="primary">Primary</Button>
                  <Button color="secondary">Secondary</Button>
                  <Button color="success">Success</Button>
                  <Button color="error">Error</Button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Con Iconos</h4>
                <div className="flex flex-wrap gap-4">
                  <Button startIcon={<AddIcon />}>Con icono inicial</Button>
                  <Button loading>Loading</Button>
                  <Button>Con Tooltip</Button>
                </div>
              </div>
            </div>
          </Paper>

          {/* CustomInput Components */}
          <Paper elevation={2} sx={{ p: 4, borderRadius: '12px' }}>
            <Typography variant="h4" gutterBottom className="mb-6">
              CustomInput
            </Typography>
            <p className="text-gray-600 mb-6">Input personalizable con validación y funcionalidades avanzadas</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Box>
                <h4 className="font-semibold mb-2">Basic</h4>
                <p className="text-sm text-gray-600 mb-3">Input básico con label</p>
                <CustomInput
                  label="Full Name"
                  placeholder="Enter your name"
                  fullWidth
                />
              </Box>

              <Box>
                <h4 className="font-semibold mb-2">Required with Tooltip</h4>
                <p className="text-sm text-gray-600 mb-3">Input requerido con información adicional</p>
                <CustomInput
                  label="Email"
                  required
                  placeholder="Enter your email"
                  fullWidth
                  textFieldProps={{ type: 'email' }}
                />
              </Box>

              <Box>
                <h4 className="font-semibold mb-2">With Error</h4>
                <p className="text-sm text-gray-600 mb-3">Input con estado de error</p>
                <CustomInput
                  label="Phone"
                  placeholder="Enter phone number"
                  fullWidth
                  error
                  helperText="Please enter a valid phone number"
                />
              </Box>

              <Box>
                <h4 className="font-semibold mb-2">Multiline</h4>
                <p className="text-sm text-gray-600 mb-3">Input de múltiples líneas</p>
                <CustomInput
                  label="Comments"
                  placeholder="Enter your comments"
                  fullWidth
                  textFieldProps={{
                    multiline: true,
                    rows: 3
                  }}
                />
              </Box>
            </div>
          </Paper>

          {/* Chip Components */}
          <Paper elevation={2} sx={{ p: 4, borderRadius: '12px' }}>
            <Typography variant="h4" gutterBottom className="mb-6">
              Chip
            </Typography>
            <p className="text-gray-600 mb-6">Componente chip para etiquetas, filtros y estados</p>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-4">Colores</h4>
                <div className="flex flex-wrap gap-4">
                  <Chip label="Primary" color="primary" />
                  <Chip label="Success" color="success" />
                  <Chip label="Error" color="error" />
                  <Chip label="Warning" color="warning" />
                  <Chip label="Default" color="default" />
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Variantes</h4>
                <div className="flex flex-wrap gap-4">
                  <Chip label="Filled" color="primary" variant="filled" />
                  <Chip label="Outlined" color="primary" variant="outlined" />
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Interactivo</h4>
                <div className="flex flex-wrap gap-4">
                  <Chip 
                    label={chipSelected ? "Selected" : "Click me"} 
                    color={chipSelected ? "primary" : "default"}
                    onClick={() => setChipSelected(!chipSelected)}
                    hoverEffect
                  />
                  <Chip label="Deletable" onDelete={() => {}} color="error" />
                </div>
              </div>
            </div>
          </Paper>

          {/* SearchInput Component */}
          <Paper elevation={2} sx={{ p: 4, borderRadius: '12px' }}>
            <Typography variant="h4" gutterBottom className="mb-6">
              SearchInput
            </Typography>
            <p className="text-gray-600 mb-6">Input de búsqueda con icono y estilo minimalista</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Box>
                <h4 className="font-semibold mb-2">Default</h4>
                <p className="text-sm text-gray-600 mb-3">Input de búsqueda básico</p>
                <SearchInput />
              </Box>

              <Box>
                <h4 className="font-semibold mb-2">With Placeholder</h4>
                <p className="text-sm text-gray-600 mb-3">Con placeholder personalizado</p>
                <SearchInput 
                  textFieldProps={{
                    placeholder: 'Search products...'
                  }}
                />
              </Box>
            </div>
          </Paper>

          {/* Table Component */}
          <Paper elevation={2} sx={{ p: 4, borderRadius: '12px' }}>
            <Typography variant="h4" gutterBottom className="mb-6">
              Table
            </Typography>
            <p className="text-gray-600 mb-6">Tabla flexible con ordenamiento, paginación y selección</p>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-4">Basic Table</h4>
                <p className="text-sm text-gray-600 mb-3">Tabla básica con datos de usuarios</p>
                <Table
                  columns={[
                    { id: 'id', label: 'ID', width: '80px' },
                    { id: 'name', label: 'Name' },
                    { id: 'email', label: 'Email' },
                    { id: 'status', label: 'Status' },
                    { id: 'role', label: 'Role' }
                  ]}
                  data={[
                    { id: 1, name: 'John Smith', email: 'john@example.com', status: 'active', role: 'Admin' },
                    { id: 2, name: 'Maria Garcia', email: 'maria@example.com', status: 'active', role: 'Editor' },
                    { id: 3, name: 'Robert Johnson', email: 'robert@example.com', status: 'inactive', role: 'Viewer' },
                    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', status: 'active', role: 'Editor' }
                  ]}
                  pageSizeOptions={[3, 5, 10]}
                  pageable={true}
                />
              </div>

              <div>
                <h4 className="font-semibold mb-4">Table with Search</h4>
                <p className="text-sm text-gray-600 mb-3">Tabla con funcionalidad de búsqueda</p>
                <Table
                  columns={[
                    { id: 'id', label: 'ID', width: '80px' },
                    { id: 'name', label: 'Name' },
                    { id: 'email', label: 'Email' },
                    { id: 'role', label: 'Role' }
                  ]}
                  data={[
                    { id: 1, name: 'John Smith', email: 'john@example.com', role: 'Admin' },
                    { id: 2, name: 'Maria Garcia', email: 'maria@example.com', role: 'Editor' },
                    { id: 3, name: 'Robert Johnson', email: 'robert@example.com', role: 'Viewer' },
                    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'Editor' },
                    { id: 5, name: 'David Brown', email: 'david@example.com', role: 'Admin' }
                  ]}
                  searchable={true}
                  searchPlaceholder="Search users..."
                  pageSizeOptions={[3, 5, 10]}
                  pageable={true}
                />
              </div>

              <div>
                <h4 className="font-semibold mb-4">Table with Selection</h4>
                <p className="text-sm text-gray-600 mb-3">Tabla con selección múltiple de filas</p>
                <Table
                  columns={[
                    { id: 'id', label: 'ID', width: '80px' },
                    { id: 'name', label: 'Name' },
                    { id: 'email', label: 'Email' },
                    { id: 'role', label: 'Role' }
                  ]}
                  data={[
                    { id: 1, name: 'John Smith', email: 'john@example.com', role: 'Admin' },
                    { id: 2, name: 'Maria Garcia', email: 'maria@example.com', role: 'Editor' },
                    { id: 3, name: 'Robert Johnson', email: 'robert@example.com', role: 'Viewer' }
                  ]}
                  selectable={true}
                  pageSizeOptions={[3, 5, 10]}
                  pageable={true}
                />
              </div>
            </div>
          </Paper>

          {/* CustomPagination Component */}
          <Paper elevation={2} sx={{ p: 4, borderRadius: '12px' }}>
            <Typography variant="h4" gutterBottom className="mb-6">
              CustomPagination
            </Typography>
            <p className="text-gray-600 mb-6">Componente de paginación responsivo para tablas y grids</p>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-4">Basic Pagination</h4>
                <p className="text-sm text-gray-600 mb-3">Paginación básica con 100 elementos</p>
                <CustomPagination
                  count={100}
                  page={0}
                  rowsPerPage={10}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  onPageChange={() => {}}
                  onRowsPerPageChange={() => {}}
                />
              </div>

              <div>
                <h4 className="font-semibold mb-4">Many Items</h4>
                <p className="text-sm text-gray-600 mb-3">Paginación con muchos elementos (1000 items)</p>
                <CustomPagination
                  count={1000}
                  page={5}
                  rowsPerPage={10}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  onPageChange={() => {}}
                  onRowsPerPageChange={() => {}}
                />
              </div>

              <div>
                <h4 className="font-semibold mb-4">Custom Options</h4>
                <p className="text-sm text-gray-600 mb-3">Paginación con opciones personalizadas</p>
                <CustomPagination
                  count={200}
                  page={2}
                  rowsPerPage={15}
                  rowsPerPageOptions={[15, 30, 50, 100]}
                  onPageChange={() => {}}
                  onRowsPerPageChange={() => {}}
                />
              </div>
            </div>
          </Paper>

        </div>
      </FormProvider>
     </div>
    </>);
};

export default Home;
