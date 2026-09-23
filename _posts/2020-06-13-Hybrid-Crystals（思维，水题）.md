---
title: "Hybrid Crystals（思维，水题）"
date: 2020-06-13 18:23:42
description: "Hybrid Crystals"
tags: [HDU]
category: "ACM"
---

# Hybrid Crystals（思维，水题）

题目链接： [Hybrid Crystals](http://acm.hdu.edu.cn/showproblem.php?pid=6140) 

题意：有三种能量石，分别是L，D，N。每颗能量石含有ai的能量。能量石可以融合，融合规则：L类型的合并可以增加ai点能量，D类型的减少，N类型的可加可减（加还是减随你自己）。并且保证第一颗能量石的能量是1，且类型是N。并且每颗能量石符合题目所给的那个公式。给你一些能量石，你需要融合其中一部分，让融合后的能量是k。

思路：

看懂那个式子，这就是一个彻底的水题了。我直接解释式子的意义了：第一颗L的取值最大是1，第二颗最大是2，第三颗最大是4，第四颗是8。D类型的同理。（假设中间没有N类型）

发现了什么了吗？后面的每一颗石头的能量最大不超过前面所有同类型的能量和。其实这就是题目所给式子的意思。而这就保证了如果开始的能量取值区间是连续的，加上某一颗石头之后仍然连续。

举个例子：

开始能量区间是 \[\-1,1\]，如果现在所能得到的能量区间为\[\-a,b\]，再加一颗能量石，若能量石是L，值是x，则融合后区间会变成 \[\-a,b\+x\]，因为式子保证了x<b；如果是R，区间变成 \[\-a\-x,b\]，因为式子保证x<a；如果是N，区间变成 \[\-a\-x,b\+x\]，因为N表示值可正可负，所以x<min\(a,b\)。

知道了这个，这不就很标准的水题了？

代码：

```cpp
#include <stdio.h>
#include <string.h>
#include <string>
#include <algorithm>
#include <iostream> 
#include <math.h>
using namespace std;
const int maxn=1005;
int a[1005];
char b[1005];
int main()
{
	int t;
	scanf("%d",&t);
	while(t--)
	{
		int n,k;
		scanf("%d%d",&n,&k);
		for(int i=1;i<=n;i++) scanf("%d",&a[i]);
		scanf("%*c");
		char ch;
		int sum=0;
		if(k>=0)
		{
			for(int i=1;i<=n;i++)
			{
				scanf("%c%*c",&ch);
				if(ch=='N' || ch=='L') sum+=a[i];
			}
			if(sum>=k) printf("yes\n");
			else printf("no\n");
		}
		else
		{
			for(int i=1;i<=n;i++)
			{
				scanf("%c%*c",&ch);
				if(ch=='N' || ch=='D') sum-=a[i];
			}
			if(sum<=k) printf("yes\n");
			else printf("no\n");
		}
	}
}
```