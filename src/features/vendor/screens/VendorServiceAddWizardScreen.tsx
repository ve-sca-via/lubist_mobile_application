import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  ServiceCategoryNode,
  useCreateVendorService,
  useDeleteVendorService,
  useServiceCategories,
  useUpdateVendorService,
  VendorServiceCreate,
} from '@/services/api/hooks/useVendorAPI';
import { VendorStackParamList } from '@/navigation/navigation.types';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

type Navigation = NativeStackNavigationProp<VendorStackParamList>;

const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 120, 150, 180];
const GENDER_OPTIONS: Array<{ value: 'male' | 'female' | 'both'; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { value: 'male', label: 'Men', icon: 'male-outline' },
  { value: 'female', label: 'Women', icon: 'female-outline' },
  { value: 'both', label: 'Unisex', icon: 'people-outline' },
];
const STEPPER_STAGES = ['Audience', 'Category', 'Services'];

interface WizardRow {
  localId: string;
  contextId: number;
  name: string;
  price: string;
  status: 'saving' | 'saved' | 'error';
  serviceId?: string;
  errorMessage?: string;
}

export function VendorServiceAddWizardScreen() {
  const navigation = useNavigation<Navigation>();
  const { data: categories } = useServiceCategories();
  const createService = useCreateVendorService();
  const updateService = useUpdateVendorService();
  const deleteService = useDeleteVendorService();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1
  const [genderCategory, setGenderCategory] = useState<'male' | 'female' | 'both' | undefined>();

  // Step 2
  const [categoryId, setCategoryId] = useState<string | undefined>();

  // Step 3
  const [subcategoryId, setSubcategoryId] = useState<string | undefined>();
  const [subcategoryName, setSubcategoryName] = useState('');
  const [subSubcategoryId, setSubSubcategoryId] = useState<string | undefined>();
  const [subSubcategoryName, setSubSubcategoryName] = useState('');

  // Batch context
  const [contextId, setContextId] = useState(0);
  const [contextLabel, setContextLabel] = useState('');
  const resolvedSubcategoryRef = useRef<Map<number, string>>(new Map());
  const nextContextId = useRef(1);
  const lastTaxonomyKeyRef = useRef<string | undefined>(undefined);

  // Step 4 shared defaults
  const [batchDuration, setBatchDuration] = useState(30);
  const [batchGender, setBatchGender] = useState<'male' | 'female' | 'both'>('both');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [batchDescription, setBatchDescription] = useState('');
  const [batchDiscount, setBatchDiscount] = useState('');

  const [rowName, setRowName] = useState('');
  const [rowPrice, setRowPrice] = useState('');
  const [rows, setRows] = useState<WizardRow[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  const selectedCategory = categories?.find((c) => c.id === categoryId);
  const currentContextRows = rows.filter((r) => r.contextId === contextId);
  const savedCount = rows.filter((r) => r.status === 'saved').length;
  const hasErrors = rows.some((r) => r.status === 'error');
  const activeStage = step >= 3 ? 3 : step;

  function handleBack() {
    if (step === 1) {
      navigation.goBack();
      return;
    }
    setStep((s) => (s - 1) as 1 | 2 | 3);
  }

  function handleStep3Continue() {
    const label = [
      selectedCategory?.name,
      subcategoryId
        ? selectedCategory?.subcategories.find((s) => s.id === subcategoryId)?.name
        : subcategoryName.trim(),
      subSubcategoryId
        ? selectedCategory?.subcategories
            .find((s) => s.id === subcategoryId)
            ?.subcategories?.find((s3) => s3.id === subSubcategoryId)?.name
        : subSubcategoryName.trim(),
    ]
      .filter(Boolean)
      .join(' › ');

    const taxonomyKey = `${categoryId}|${subcategoryId ?? subcategoryName.trim()}|${subSubcategoryId ?? subSubcategoryName.trim()}`;
    if (taxonomyKey !== lastTaxonomyKeyRef.current) {
      const newContextId = nextContextId.current++;
      setContextId(newContextId);
      lastTaxonomyKeyRef.current = taxonomyKey;
    }
    setContextLabel(label);
    setBatchGender(genderCategory ?? 'both');
    setStep(4);
  }

  function buildRowPayload(name: string, price: number): VendorServiceCreate {
    const resolved = resolvedSubcategoryRef.current.get(contextId);
    const base: VendorServiceCreate = {
      name,
      description: batchDescription.trim() || undefined,
      price,
      discount_percentage: batchDiscount.trim() ? Number(batchDiscount) : undefined,
      duration_minutes: batchDuration,
      gender_category: batchGender,
      is_active: true,
      category_id: categoryId,
    };
    if (resolved) {
      base.subcategory_id = resolved;
      return base;
    }
    if (subcategoryId) base.subcategory_id = subcategoryId;
    else if (subcategoryName.trim()) base.subcategory_name = subcategoryName.trim();
    if (subSubcategoryId) base.sub_subcategory_id = subSubcategoryId;
    else if (subSubcategoryName.trim()) base.sub_subcategory_name = subSubcategoryName.trim();
    return base;
  }

  function enqueueSave(row: WizardRow, priceValue: number) {
    saveQueueRef.current = saveQueueRef.current.then(async () => {
      try {
        const payload = buildRowPayload(row.name, priceValue);
        const created = await createService.mutateAsync(payload);
        if (!resolvedSubcategoryRef.current.has(row.contextId) && created.subcategory_id) {
          resolvedSubcategoryRef.current.set(row.contextId, created.subcategory_id);
        }
        setRows((prev) =>
          prev.map((r) => (r.localId === row.localId ? { ...r, status: 'saved', serviceId: created.id } : r)),
        );
      } catch (err: any) {
        setRows((prev) =>
          prev.map((r) =>
            r.localId === row.localId
              ? { ...r, status: 'error', errorMessage: err?.message || 'Failed to save' }
              : r,
          ),
        );
      }
    });
  }

  function handleAddRow() {
    const trimmedName = rowName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 255) {
      Alert.alert('Invalid name', 'Service name must be 2-255 characters.');
      return;
    }
    const priceValue = Number(rowPrice);
    if (rowPrice.trim() === '' || Number.isNaN(priceValue) || priceValue < 0) {
      Alert.alert('Invalid price', 'Enter a valid price (0 or more).');
      return;
    }
    if (batchDiscount.trim()) {
      const discount = Number(batchDiscount);
      if (Number.isNaN(discount) || discount < 0 || discount > 100) {
        Alert.alert('Invalid discount', 'Discount must be between 0 and 100.');
        return;
      }
      if (discount > 0 && priceValue <= 0) {
        Alert.alert('Invalid discount', 'Discount can only be applied when price is greater than 0.');
        return;
      }
    }
    const duplicate = currentContextRows.some(
      (r) => r.name.toLowerCase() === trimmedName.toLowerCase() && r.status !== 'error',
    );
    if (duplicate) {
      Alert.alert('Duplicate service', `"${trimmedName}" was already added in this batch.`);
      return;
    }

    const localId = `${Date.now()}-${Math.random()}`;
    const newRow: WizardRow = { localId, contextId, name: trimmedName, price: rowPrice, status: 'saving' };
    setRows((prev) => [newRow, ...prev]);
    enqueueSave(newRow, priceValue);
    setRowName('');
    setRowPrice('');
  }

  function handleRetry(row: WizardRow) {
    setRows((prev) => prev.map((r) => (r.localId === row.localId ? { ...r, status: 'saving' } : r)));
    enqueueSave(row, Number(row.price));
  }

  function startEdit(row: WizardRow) {
    setEditingRowId(row.localId);
    setEditName(row.name);
    setEditPrice(row.price);
  }

  async function saveEdit(row: WizardRow) {
    if (!row.serviceId) {
      setRows((prev) =>
        prev.map((r) => (r.localId === row.localId ? { ...r, name: editName.trim(), price: editPrice } : r)),
      );
      setEditingRowId(null);
      return;
    }
    try {
      await updateService.mutateAsync({
        serviceId: row.serviceId,
        update: { name: editName.trim(), price: Number(editPrice) },
      });
      setRows((prev) =>
        prev.map((r) => (r.localId === row.localId ? { ...r, name: editName.trim(), price: editPrice } : r)),
      );
      setEditingRowId(null);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update');
    }
  }

  async function handleDeleteRow(row: WizardRow) {
    if (row.serviceId) {
      try {
        await deleteService.mutateAsync(row.serviceId);
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Failed to delete');
        return;
      }
    }
    setRows((prev) => prev.filter((r) => r.localId !== row.localId));
  }

  function handleDone() {
    if (hasErrors) {
      const errorCount = rows.filter((r) => r.status === 'error').length;
      Alert.alert(
        'Unsaved services',
        `${errorCount} service(s) failed to save and will be lost. Leave anyway?`,
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => navigation.goBack() },
        ],
      );
      return;
    }
    navigation.goBack();
  }

  const canGoNext =
    (step === 1 && !!genderCategory) ||
    (step === 2 && !!categoryId) ||
    (step === 3 && !!(subcategoryId || subcategoryName.trim()));

  function handlePrimaryFooterAction() {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3) handleStep3Continue();
    else handleDone();
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={handleBack} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color="#1c1b1b" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.hero}>Build a service catalog.</Text>

        <View style={styles.stepper}>
          {STEPPER_STAGES.map((label, idx) => {
            const stageNumber = idx + 1;
            const active = stageNumber <= activeStage;
            return (
              <View key={label} style={[styles.stepperPill, active && styles.stepperPillActive]}>
                <View style={[styles.stepperBadge, active && styles.stepperBadgeActive]}>
                  <Text style={[styles.stepperBadgeLabel, active && styles.stepperBadgeLabelActive]}>
                    {String(stageNumber).padStart(2, '0')}
                  </Text>
                </View>
                <Text style={[styles.stepperLabel, active && styles.stepperLabelActive]}>{label}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.stepperDivider} />

        {step === 1 ? (
          <>
            <StepHeader step={1} heading="Select target audience" />
            <View style={styles.optionList}>
              {GENDER_OPTIONS.map((opt) => {
                const active = genderCategory === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    style={[styles.optionCard, active && styles.optionCardActive]}
                    onPress={() => setGenderCategory(opt.value)}
                  >
                    <View style={styles.optionIconWrap}>
                      <Ionicons name={opt.icon} size={18} color="#615e56" />
                    </View>
                    <View style={styles.optionTextWrap}>
                      <Text style={styles.optionLabel}>{opt.label}</Text>
                      <Text style={styles.optionDescription}>Services tailored for {opt.label.toLowerCase()}.</Text>
                    </View>
                    {active ? (
                      <View style={styles.optionCheck}>
                        <Ionicons name="checkmark" size={13} color="#fff" />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <StepHeader step={2} heading="Select a category" />
            <View style={styles.optionList}>
              {(categories ?? []).map((cat: ServiceCategoryNode) => {
                const active = categoryId === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    style={[styles.optionCard, active && styles.optionCardActive]}
                    onPress={() => {
                      setCategoryId(cat.id);
                      setSubcategoryId(undefined);
                      setSubcategoryName('');
                      setSubSubcategoryId(undefined);
                      setSubSubcategoryName('');
                    }}
                  >
                    <View style={styles.optionTextWrap}>
                      <Text style={styles.optionLabel}>{cat.name}</Text>
                      {cat.description ? <Text style={styles.optionDescription}>{cat.description}</Text> : null}
                    </View>
                    {active ? (
                      <View style={styles.optionCheck}>
                        <Ionicons name="checkmark" size={13} color="#fff" />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <StepHeader step={3} heading="Choose a subcategory" />
            <View style={styles.optionList}>
              {(selectedCategory?.subcategories ?? []).map((sub) => {
                const active = subcategoryId === sub.id;
                return (
                  <Pressable
                    key={sub.id}
                    style={[styles.optionCard, active && styles.optionCardActive]}
                    onPress={() => {
                      setSubcategoryId(sub.id);
                      setSubcategoryName('');
                      setSubSubcategoryId(undefined);
                      setSubSubcategoryName('');
                    }}
                  >
                    <View style={styles.optionTextWrap}>
                      <Text style={styles.optionLabel}>{sub.name}</Text>
                    </View>
                    {active ? (
                      <View style={styles.optionCheck}>
                        <Ionicons name="checkmark" size={13} color="#fff" />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.shadedField}>
              <TextInput
                style={styles.shadedInput}
                placeholder="Or add a new subcategory…"
                placeholderTextColor="#867461"
                value={subcategoryName}
                onChangeText={(v) => {
                  setSubcategoryName(v);
                  if (v) {
                    setSubcategoryId(undefined);
                    setSubSubcategoryId(undefined);
                    setSubSubcategoryName('');
                  }
                }}
              />
            </View>

            {subcategoryId || subcategoryName.trim() ? (
              <View style={styles.subSubSection}>
                <Text style={styles.subLabel}>Sub-type (optional)</Text>
                {subcategoryId ? (
                  <View style={styles.chipRow}>
                    {(selectedCategory?.subcategories.find((s) => s.id === subcategoryId)?.subcategories ?? []).map(
                      (sub3) => (
                        <Pressable
                          key={sub3.id}
                          style={[styles.chip, subSubcategoryId === sub3.id && styles.chipActive]}
                          onPress={() => {
                            setSubSubcategoryId(sub3.id);
                            setSubSubcategoryName('');
                          }}
                        >
                          <Text style={[styles.chipLabel, subSubcategoryId === sub3.id && styles.chipLabelActive]}>
                            {sub3.name}
                          </Text>
                        </Pressable>
                      ),
                    )}
                  </View>
                ) : null}
                <View style={[styles.shadedField, styles.spaced]}>
                  <TextInput
                    style={styles.shadedInput}
                    placeholder="Or add a new sub-type…"
                    placeholderTextColor="#867461"
                    value={subSubcategoryName}
                    onChangeText={(v) => {
                      setSubSubcategoryName(v);
                      if (v) setSubSubcategoryId(undefined);
                    }}
                  />
                </View>
              </View>
            ) : null}
          </>
        ) : null}

        {step === 4 ? (
          <>
            <StepHeader step={4} heading={contextLabel || 'Add services'} />

            <View style={styles.groupCard}>
              <Text style={styles.subLabel}>Applies to every service added below</Text>
              <View style={styles.chipRow}>
                {DURATION_OPTIONS.map((minutes) => (
                  <Pressable
                    key={minutes}
                    style={[styles.chip, batchDuration === minutes && styles.chipActive]}
                    onPress={() => setBatchDuration(minutes)}
                  >
                    <Text style={[styles.chipLabel, batchDuration === minutes && styles.chipLabelActive]}>
                      {minutes} min
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={[styles.chipRow, styles.spaced]}>
                {GENDER_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[styles.chip, batchGender === opt.value && styles.chipActive]}
                    onPress={() => setBatchGender(opt.value)}
                  >
                    <Text style={[styles.chipLabel, batchGender === opt.value && styles.chipLabelActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Pressable onPress={() => setShowMoreOptions((v) => !v)}>
                <Text style={styles.moreOptionsLabel}>{showMoreOptions ? 'Hide options' : 'More options'}</Text>
              </Pressable>
              {showMoreOptions ? (
                <View style={styles.spaced}>
                  <View style={styles.shadedField}>
                    <TextInput
                      style={[styles.shadedInput, styles.multiline]}
                      placeholder="Shared description (optional)"
                      placeholderTextColor="#867461"
                      value={batchDescription}
                      onChangeText={(v) => setBatchDescription(v.slice(0, 250))}
                      multiline
                    />
                  </View>
                  <View style={[styles.shadedField, styles.spaced]}>
                    <TextInput
                      style={styles.shadedInput}
                      placeholder="Shared discount % (optional)"
                      placeholderTextColor="#867461"
                      value={batchDiscount}
                      onChangeText={setBatchDiscount}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              ) : null}
            </View>

            <View style={styles.groupCard}>
              <View style={styles.entryRow}>
                <View style={[styles.shadedField, styles.entryName]}>
                  <TextInput
                    style={styles.shadedInput}
                    placeholder="Service name"
                    placeholderTextColor="#867461"
                    value={rowName}
                    onChangeText={setRowName}
                    onSubmitEditing={handleAddRow}
                  />
                </View>
                <View style={[styles.shadedField, styles.entryPrice]}>
                  <TextInput
                    style={styles.shadedInput}
                    placeholder="Price"
                    placeholderTextColor="#867461"
                    value={rowPrice}
                    onChangeText={setRowPrice}
                    keyboardType="decimal-pad"
                    onSubmitEditing={handleAddRow}
                  />
                </View>
                <Pressable style={styles.addServiceButton} onPress={handleAddRow}>
                  <Ionicons name="add" size={14} color="#fff" />
                  <Text style={styles.addServiceButtonLabel}>Add</Text>
                </Pressable>
              </View>
            </View>

            {rows.length > 0 ? (
              <View style={styles.rowList}>
                {rows.map((row) => (
                  <View key={row.localId} style={styles.rowCard}>
                    {editingRowId === row.localId ? (
                      <View style={styles.entryRow}>
                        <View style={[styles.shadedField, styles.entryName]}>
                          <TextInput style={styles.shadedInput} value={editName} onChangeText={setEditName} />
                        </View>
                        <View style={[styles.shadedField, styles.entryPrice]}>
                          <TextInput
                            style={styles.shadedInput}
                            value={editPrice}
                            onChangeText={setEditPrice}
                            keyboardType="decimal-pad"
                          />
                        </View>
                        <Pressable style={styles.addServiceButton} onPress={() => saveEdit(row)}>
                          <Text style={styles.addServiceButtonLabel}>Save</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <>
                        <View style={styles.rowTopRow}>
                          <Text style={styles.rowName}>{row.name}</Text>
                          {row.status === 'saving' ? (
                            <ActivityIndicator color={palette.primary} size="small" />
                          ) : (
                            <View style={styles.rowIconActions}>
                              <Pressable onPress={() => (row.status === 'saved' ? startEdit(row) : handleRetry(row))}>
                                <Ionicons
                                  name={row.status === 'saved' ? 'pencil-outline' : 'refresh-outline'}
                                  size={15}
                                  color="#615e56"
                                />
                              </Pressable>
                              <Pressable onPress={() => handleDeleteRow(row)}>
                                <Ionicons name="trash-outline" size={15} color="#ba1a1a" />
                              </Pressable>
                            </View>
                          )}
                        </View>
                        <View style={styles.tagRow}>
                          <Text style={styles.tag}>₹{row.price}</Text>
                          <Text style={styles.tag}>{batchDuration} min</Text>
                          <Text style={styles.tag}>{GENDER_OPTIONS.find((g) => g.value === batchGender)?.label}</Text>
                        </View>
                        {row.status === 'saved' ? (
                          <View style={styles.savedRow}>
                            <View style={styles.savedPill}>
                              <Ionicons name="checkmark" size={11} color="#166534" />
                              <Text style={styles.savedPillLabel}>Saved</Text>
                            </View>
                          </View>
                        ) : row.status === 'error' ? (
                          <Text style={styles.rowError}>{row.errorMessage}</Text>
                        ) : null}
                      </>
                    )}
                  </View>
                ))}
              </View>
            ) : null}

            <Pressable style={styles.changeSubcategoryButton} onPress={() => setStep(3)}>
              <Text style={styles.changeSubcategoryLabel}>Change subcategory</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={[styles.backButton, step === 1 && styles.backButtonDisabled]} onPress={handleBack}>
          <Ionicons name="arrow-back" size={14} color="#615e56" />
          <Text style={styles.backButtonLabel}>Back</Text>
        </Pressable>
        <Pressable
          style={[styles.nextButton, !canGoNext && step !== 4 && styles.nextButtonDisabled]}
          disabled={step !== 4 && !canGoNext}
          onPress={handlePrimaryFooterAction}
        >
          <Text style={styles.nextButtonLabel}>
            {step === 4 ? (savedCount > 0 ? `Finish — ${savedCount} added` : 'Finish') : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={14} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

function StepHeader({ step, heading }: { step: number; heading: string }) {
  return (
    <View style={styles.stepHeaderCard}>
      <Text style={styles.stepEyebrow}>STEP {String(step).padStart(2, '0')}</Text>
      <Text style={styles.stepHeading}>{heading}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.background,
    flex: 1,
  },
  topBar: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  body: {
    gap: 4,
    padding: 24,
    paddingBottom: 40,
  },
  hero: {
    color: '#1c1b1b',
    fontSize: 30,
    fontWeight: typography.weight.bold,
    marginBottom: 16,
  },
  stepper: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  stepperPill: {
    alignItems: 'center',
    backgroundColor: '#f0eded',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  stepperPillActive: {
    backgroundColor: '#fff',
    borderColor: '#e8e2d8',
    borderWidth: 1,
    paddingLeft: 4,
    paddingRight: 12,
    paddingVertical: 4,
  },
  stepperBadge: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  stepperBadgeActive: {
    backgroundColor: palette.primary,
    borderRadius: 999,
    height: 24,
    width: 24,
  },
  stepperBadgeLabel: {
    color: '#615e56',
    fontSize: 10,
    fontWeight: typography.weight.bold,
  },
  stepperBadgeLabelActive: {
    color: '#fff',
  },
  stepperLabel: {
    color: '#615e56',
    fontSize: 12,
    fontWeight: typography.weight.semibold,
  },
  stepperLabelActive: {
    color: '#1c1b1b',
  },
  stepperDivider: {
    backgroundColor: '#e8e2d8',
    height: 1,
    marginBottom: 20,
  },
  stepHeaderCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    gap: 6,
    marginBottom: 20,
    padding: 24,
  },
  stepEyebrow: {
    color: '#615e56',
    fontSize: 12,
    fontWeight: typography.weight.semibold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  stepHeading: {
    color: '#1c1b1b',
    fontSize: 22,
    fontWeight: typography.weight.semibold,
  },
  optionList: {
    gap: 14,
    marginBottom: 8,
  },
  optionCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e8e2d8',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 20,
  },
  optionCardActive: {
    borderColor: palette.primary,
    borderWidth: 2,
  },
  optionIconWrap: {
    alignItems: 'center',
    backgroundColor: '#f0eded',
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  optionTextWrap: {
    flex: 1,
    gap: 4,
  },
  optionLabel: {
    color: '#1c1b1b',
    fontSize: 18,
    fontWeight: typography.weight.semibold,
  },
  optionDescription: {
    color: '#554339',
    fontSize: 13,
    lineHeight: 19,
  },
  optionCheck: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 999,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  shadedField: {
    backgroundColor: '#fcf9f8',
    borderRadius: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  shadedInput: {
    color: '#1c1b1b',
    fontSize: 15,
    padding: 0,
  },
  multiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  subSubSection: {
    marginTop: 20,
  },
  subLabel: {
    color: '#554339',
    fontSize: 13,
    fontWeight: typography.weight.semibold,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  spaced: {
    marginTop: 12,
  },
  chip: {
    backgroundColor: '#fcf9f8',
    borderColor: '#e8e2d8',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  chipLabel: {
    color: '#1c1b1b',
    fontSize: 13,
    fontWeight: typography.weight.medium,
  },
  chipLabelActive: {
    color: '#fff',
  },
  moreOptionsLabel: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: typography.weight.semibold,
    marginTop: 12,
  },
  groupCard: {
    backgroundColor: '#fcf9f8',
    borderColor: '#e8e2d8',
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 16,
    padding: 20,
  },
  entryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  entryName: {
    flex: 2,
    marginTop: 0,
  },
  entryPrice: {
    flex: 1,
    marginTop: 0,
  },
  addServiceButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addServiceButtonLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: typography.weight.semibold,
  },
  rowList: {
    gap: 10,
    marginBottom: 16,
  },
  rowCard: {
    backgroundColor: '#fff',
    borderColor: '#e8e2d8',
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  rowTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowName: {
    color: '#1c1b1b',
    fontSize: 15,
    fontWeight: typography.weight.semibold,
  },
  rowIconActions: {
    flexDirection: 'row',
    gap: 14,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#f0eded',
    borderRadius: 6,
    color: '#554339',
    fontSize: 11,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  savedRow: {
    flexDirection: 'row',
  },
  savedPill: {
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  savedPillLabel: {
    color: '#166534',
    fontSize: 11,
    fontWeight: typography.weight.semibold,
  },
  rowError: {
    color: '#ba1a1a',
    fontSize: 12,
  },
  changeSubcategoryButton: {
    alignItems: 'center',
    borderColor: '#e8e2d8',
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 8,
    paddingVertical: 14,
  },
  changeSubcategoryLabel: {
    color: '#1c1b1b',
    fontSize: 14,
    fontWeight: typography.weight.medium,
  },
  footer: {
    alignItems: 'center',
    backgroundColor: '#fcf9f8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingHorizontal: 24,
    paddingTop: 16,
    shadowColor: '#c56a2d',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  backButton: {
    alignItems: 'center',
    borderColor: '#e8e2d8',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backButtonDisabled: {
    opacity: 0.5,
  },
  backButtonLabel: {
    color: '#615e56',
    fontSize: 14,
    fontWeight: typography.weight.medium,
  },
  nextButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: typography.weight.medium,
  },
});
