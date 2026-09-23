---
title: "个人对Numpy中transpose()函数的理解"
date: 2024-11-04 19:21:32
description: "NumPy中的transpose()函数用于对数组进行转置"
tags: [数学]
category: "技术笔记"
---

# 个人对Numpy中transpose()函数的理解

NumPy中的transpose\(\)函数用于对数组进行转置：

如果函数中不传递任何参数，它将进行标准的矩阵转置；

如果传递了一个轴序列，NumPy将按照这个序列重新排列轴。

二维的转置很好理解，就是线性代数中的矩阵转置。但高纬度的转置就有点抽象了，反正我一开始确实没太懂它是怎么进行转置/轴变换的。

[numpy官方的文档](https://numpy.org/devdocs/reference/generated/numpy.transpose.html#numpy.transpose) 没什么用，就不贴出来了，想看的自己去看。

下面是GPT的解释：

> 在 NumPy 中，多维数组的 \`transpose\` 通过重新排列步长（\`strides\`）来实现轴的重新排列。以下是具体的操作流程：
> 
> 1\. \*\*原始数据和步长\*\*：NumPy 数组的底层数据是连续存储的，每个维度的步长决定了沿该维度移动一个元素的字节数。
> 
> 2\. \*\*获取形状和步长\*\*：\`transpose\` 函数首先获取数组的当前形状和步长。
> 
> 3\. \*\*根据新轴顺序重新排列\*\*：假设我们有一个 3D 数组 \`A\`，形状是 \`\(2, 3, 4\)\`，步长是 \`\(48, 16, 4\)\`。如果新轴顺序是 \`\(1, 2, 0\)\`，则 \`transpose\` 会按顺序排列新步长 \`\(16, 4, 48\)\` 和新形状 \`\(3, 4, 2\)\`。
> 
> 4\. \*\*创建视图而非复制数据\*\*：\`transpose\` 会根据新步长和新形状生成一个新的视图，这样读取时将按新的轴顺序访问数据，但数据在内存中的实际位置没有改变。
> 
> 这种操作方式能高效地实现多维数组的轴变换。

> 在 NumPy 中，步长（\`strides\`）表示在每个维度上移动一个元素所需的字节数。对于多维数组，步长帮助确定如何在内存中访问元素。比如，一个数组的步长指示从一个元素跳到下一个元素时，应该跳过多少字节。步长在执行诸如转置（\`transpose\`）等操作时非常重要，因为它决定了如何根据新的轴顺序访问原始数据而不需复制。

简单来说，轴重新排列就是把原来的轴的读取顺序换成了新的轴的读取顺序，然后又改回了原来\(0,1,2,3\)顺序的表现。可能还是有点抽象，我直接举个具体的例子来说。

> a = np\.array\(\[5,15,8,41,39,30,39,18,23,42,25,13,15,6,36,25,14,4,42,20,44,3,19,7,24,36,45,38,14,47,23,42,18,31,8,2,20,21,41,8,8,2,11,33,32,31,32,47\]\)\.reshape\(2,3,2,4\)

a是一个四维的矩阵。打印出来的a是这样的

> ```
> [[[[ 5 15  8 41]
>    [39 30 39 18]]
> 
>   [[23 42 25 13]
>    [15  6 36 25]]
> 
>   [[14  4 42 20]
>    [44  3 19  7]]]
> 
> 
>  [[[24 36 45 38]
>    [14 47 23 42]]
> 
>   [[18 31  8  2]
>    [20 21 41  8]]
> 
>   [[ 8  2 11 33]
>    [32 31 32 47]]]]
> ```

那么，a\.transpose是什么样的呢？

> ```
> [[[[ 5, 24],
>          [23, 18],
>          [14,  8]],
> 
>         [[39, 14],
>          [15, 20],
>          [44, 32]]],
> 
> 
>        [[[15, 36],
>          [42, 31],
>          [ 4,  2]],
> 
>         [[30, 47],
>          [ 6, 21],
>          [ 3, 31]]],
> 
> 
>        [[[ 8, 45],
>          [25,  8],
>          [42, 11]],
> 
>         [[39, 23],
>          [36, 41],
>          [19, 32]]],
> 
> 
>        [[[41, 38],
>          [13,  2],
>          [20, 33]],
> 
>         [[18, 42],
>          [25,  8],
>          [ 7, 47]]]]
> ```

问题来了，这个转置后的a的轴的顺序是什么样的？答案是\(3,2,1,0\)

不过如果我们在不知道答案的情况下，怎么看出来这个答案呢？

首先，我们以\(0,0,0,0\)为起点往四根轴看。

3号轴 \[5 15 8 41\]

2号轴 \[5,39\]

1号轴 \[5 23 14\]

0号轴 \[5 24\]

这应该很容易能看出来。如果不知道轴怎么排的，我在文末有补充。

然后我们看下转置后的4根轴

3号轴 \[5 24\]

2号轴 \[5 23 14\]

1号轴 \[5 39\]

0号轴 \[5 15 8 41\]

也就是说原来的3号轴现在变成了0号，2号变成了1号，1号变成了2号，0号变成了3号。所以答案是\(3,2,1,0\)。可以验证：

 <img src="/assets/posts/79_1.png" alt="" style="max-height:377px; box-sizing:content-box;" />

所以如果我们需要将轴重新排列，也可以用同样的方法进行，只要将主要的几根轴变完了，其他元素按相对位置填进去就可以了。

我空间想象力不行，就不做可视化的分析了，这里直接贴链接。 [](https://zhuanlan.zhihu.com/p/61203757/) 

下面是我用C\+\+实现的transpose。虽然我感觉也许可能会更难理解？只有少量的必要的注释，结合前文自己理解吧，这注释确实不太好写

```cpp
#include <bits/stdc++.h>
using namespace std;
void printArray(int *arr, const int len, const int dim, int *dims, int *axis)
{
//	printf("dims:");for (int i=0; i<dim; i++) printf("%d%c", dims[i], i==dim-1?'\n':' ');
	int sufMul[dim]; //后缀乘积 用于计算每个维度的步长stride
	int idx=0;
	sufMul[dim-1]=1;
	for (int i=dim-2; i>=0; i--)
	{
		sufMul[i] = sufMul[i+1]*dims[i+1];
	}
//	printf("sufMul:");for (int i=0; i<dim; i++) printf("%d%c", sufMul[i], i==dim-1?'\n':' ');
	
	int stride[dim]; // 步长stride，即沿某一维度走一步，在底层的一维数组移动了多少步 
	for (int i=0; i<dim; ++i)
	{
		stride[i] = sufMul[axis[i]];
	}
//	printf("stride:");for (int i=0; i<dim; i++) printf("%d%c", stride[i], i==dim-1?'\n':' ');
	
	int newDim[dim]; // 轴变换后，新的每个轴的长度 
	for (int i=0; i<dim; ++i)
	{
		newDim[i] = dims[axis[i]];
	}
//	printf("newDim:");for (int i=0; i<dim; i++) printf("%d%c", newDim[i], i==dim-1?'\n':' ');
	
	int newSufMul[dim]; // 轴变换后的后缀乘积，只是用于格式打印输出换行 
	newSufMul[dim-1]=1;
	for (int i=dim-2; i>=0; i--)
	{
		newSufMul[i] = newSufMul[i+1]*newDim[i+1];
	}
//	printf("sufMul:");for (int i=0; i<dim; i++) printf("%d%c", newSufMul[i], i==dim-1?'\n':' ');
	
	idx = 0; // idx表示输出到第几个元素 
	while (idx < len)
	{
		int index=0, tmp=idx, i=dim; // index表示该元素在arr中的下标 
		while (i--)
		{
			index += (tmp%newDim[i]) * stride[i]; // tmp%newDim[i] 表示在某一维度的下标
			// vec.push_back(tmp%newDim[i])  // idx新轴序下的坐标 
			tmp /= newDim[i];
		}
		printf("%d,", arr[index]);
//		printf("index=%d, idx=%d\n", index, idx);
		for (int t=0; t<dim-1; ++t)
		{
//			printf("**t=%d, sumMul[t]=%d, dix+1=%d**", t, sufMul[t], idx);
			if (((idx+1) % newSufMul[t]) == 0)
			{
				for (int i=0; i<dim-t-1; i++) printf("\n");
				break;
			}
		}
		idx++;
	}
}
int main()
{
	srand(time(0));
	int dim;
	printf("input dimension:");
	scanf("%d", &dim);
	
	int dims[dim];
	int len=1;
	printf("input shape(split by space):");
	for (int i=0; i<dim; ++i)
	{
		scanf("%d", &dims[i]);
		len *= dims[i];
	}
	
	printf("input %d numbers(split by space):", len);
	int arr[len];
	for (int i=0; i<len; ++i)
	{
//		scanf("%d", &arr[i]);
		arr[i] = rand()%50;
	}
	
	for (int i=0; i<len; i++) printf("%d%c", arr[i], i==len-1?'\n':',');
	
	int axis[dim];
	for (int i=0; i<dim; i++) axis[i]=i;
	printArray(arr, len, dim, dims, axis); //打印原始的形状 
	
	printf("input axis[0-%d](split by space):", dim-1);
	for (int i=0; i<dim; i++)
	{
		scanf("%d", &axis[i]);
	}
	printArray(arr, len, dim, dims, axis); // 打印重排轴之后的形状 
}
```

或许我应该放个python的实现会更合适一点？这里就先挖个坑下次再填吧

如果不太明白轴的顺序，我简单说一下。最先填充的方向轴序号最大，最后填充的方向是0轴。

就像一维是从左到右填充的，最后填充的方向就是从左到右的，所以从左到右就是0号轴。

二维是先从左到右，然后从上到下填充的，最先是从左到右的，所以从左到右是1号轴。一行填完之后从上往下填，所以从上到下是0号轴。

同理，三维的填充顺序就是先填完一层二维的，然后从前往后填充，所以前后方向是0号轴，每一层的填充顺序与二维一致，所以二维的轴的编号加个一就是三维里的编号了。

更高维的也是一样的道理，新的方向是0轴，原来的轴就依次加一。